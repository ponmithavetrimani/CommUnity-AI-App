import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Vibration,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import api from "../../services/api";
import LiveMap from "../../components/LiveMap";
import {
  Coords,
  distanceToRoute,
  interpolateRoute,
} from "../../utils/geoUtils";

// Same tokens as home.tsx / buddy.tsx / _layout.tsx.
const COLORS = {
  bg: "#F8F5F6",
  surface: "#FFFFFF",
  heroFrom: "#4A0E2A",
  heroTo: "#8B1E4A",
  primary: "#7A1B41",
  primarySoft: "#FBEAF0",
  textPrimary: "#20141C",
  textSecondary: "#8A7C86",
  success: "#12B76A",
  successSoft: "#E7F9EF",
  sos: "#D6295E",
};

// Deviation must exceed this distance from the expected route...
const DEVIATION_THRESHOLD_METERS = 300;
// ...for this many consecutive GPS readings before we treat it as real
// (avoids false alarms from a single noisy GPS fix).
const DEVIATION_CONFIRM_COUNT = 3;

// Used only until a live GPS speed reading comes in (native only) — a
// reasonable average for city bus/auto/walking-mixed travel, so the very
// first ETA shown is already in the right ballpark instead of a placeholder.
const ASSUMED_SPEED_KMH = 22;

function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Nominatim is a plain HTTP API (unlike expo-location's native geocoder), so
// it works identically on web, iOS and Android — this is what makes the ETA
// real on web/emulator instead of silently falling back to a static demo value.
//
// A bare local-area name like "Ukkadam" or "Gandhipuram" is ambiguous to a
// global geocoder without city context, so we bias the search toward the
// user's current location (a soft "viewbox", not a hard restriction) and,
// if that still comes up empty, retry once with a broader query.
async function geocodePlace(query: string, bias: Coords | null): Promise<Coords | null> {
  const tryFetch = async (q: string) => {
    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
      if (bias) {
        const span = 0.35; // roughly a 35-40km box around the user, bias only (not a hard filter)
        const left = bias.longitude - span;
        const right = bias.longitude + span;
        const top = bias.latitude + span;
        const bottom = bias.latitude - span;
        url += `&viewbox=${left},${top},${right},${bottom}&bounded=0`;
      }
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data && data[0]) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.log("Geocoding failed:", e);
    }
    return null;
  };

  const direct = await tryFetch(query);
  if (direct) return direct;

  // Broader retry — helps when the bare local name alone returns nothing.
  return tryFetch(`${query}, India`);
}

// Best-effort current position, used only to bias geocoding results toward
// the user's area — never blocks the ETA flow if it fails or is denied.
async function getBiasLocation(): Promise<Coords | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch (e) {
    console.log("Bias location unavailable:", e);
    return null;
  }
}

// Shown only if geocoding fails completely (both direct and broadened
// queries) — keeps the ETA screen usable instead of stuck on "Calculating".
const FALLBACK_ROUTE_KM = 6;

// Real road-network distance + duration (like a driving-directions API) —
// far more accurate than a straight-line guess, since actual roads rarely
// go in a straight line between two points. Public OSRM demo server: fine
// for a college project's traffic, not for heavy production load.
// "overview=full&geometries=geojson" also gives us the actual road-following
// path so the live map can draw a real route instead of a straight line.
async function getRoadRoute(
  a: Coords,
  b: Coords
): Promise<{ km: number; seconds: number; path: Coords[] } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${a.longitude},${a.latitude};${b.longitude},${b.latitude}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.routes?.[0]) {
      const route = data.routes[0];
      const path: Coords[] = (route.geometry?.coordinates || []).map((c: number[]) => ({
        longitude: c[0],
        latitude: c[1],
      }));
      return { km: route.distance / 1000, seconds: route.duration, path };
    }
  } catch (e) {
    console.log("Road routing failed:", e);
  }
  return null;
}

export default function TrackingPage() {
  const {
    source,
    destination,
    transport,
    busNumber,
    startTime,
    buddyName,
  } = useLocalSearchParams();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [totalEtaSeconds, setTotalEtaSeconds] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [journeyCompleted, setJourneyCompleted] = useState(false);

  // ===== ROUTE + ETA STATE =====
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [remainingDistanceKm, setRemainingDistanceKm] = useState<number | null>(null);
  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [impliedSpeedKmh, setImpliedSpeedKmh] = useState<number | null>(null);
  const [geocodeFailed, setGeocodeFailed] = useState(false);

  // ===== MAP STATE =====
  const [sourceMapCoords, setSourceMapCoords] = useState<Coords | null>(null);
  const [destMapCoords, setDestMapCoords] = useState<Coords | null>(null);
  const [routePath, setRoutePath] = useState<Coords[]>([]);

  // ===== LIVE LOCATION + ROUTE DEVIATION STATE =====
  const [currentLocation, setCurrentLocation] = useState<Coords | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceFromRoute, setDistanceFromRoute] = useState<number | null>(null);
  const [deviationAlertActive, setDeviationAlertActive] = useState(false);

  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const deviationStreak = useRef(0);
  const alertAlreadySent = useRef(false);
  const destCoordsRef = useRef<Coords | null>(null);
  const lastFixRef = useRef<{ coords: Coords; time: number } | null>(null);
  const speedRef = useRef(0);
  const hadDeviationRef = useRef(false);

  useEffect(() => {
    setupRouteAndEta();

    return () => {
      watchSubscription.current?.remove();
      Vibration.cancel();
    };
  }, []);

  const setupRouteAndEta = async () => {
    // 0) Best-effort device location, used only to bias the geocoder toward
    // the user's area so short local names like "Ukkadam" resolve correctly.
    const bias = await getBiasLocation();

    // 1) Geocode source/destination — works on web AND native since it's
    // just an HTTP call, unlike expo-location's native-only geocoder.
    const [sourceCoords, destCoords] = await Promise.all([
      geocodePlace(String(source || ""), bias),
      geocodePlace(String(destination || ""), bias),
    ]);

    let expectedRoute: Coords[] = [];

    if (sourceCoords && destCoords) {
      destCoordsRef.current = destCoords;
      expectedRoute = interpolateRoute(sourceCoords, destCoords);
      setSourceMapCoords(sourceCoords);
      setDestMapCoords(destCoords);

      // Prefer real road distance/duration (OSRM) — this is what makes the
      // ETA "correct for every place" instead of a straight-line guess.
      const roadRoute = await getRoadRoute(sourceCoords, destCoords);

      if (roadRoute) {
        setRouteDistanceKm(roadRoute.km);
        setRemainingDistanceKm(roadRoute.km);
        const etaSeconds = Math.max(60, Math.round(roadRoute.seconds));
        setTotalEtaSeconds(etaSeconds);
        setTimeLeft(etaSeconds);
        setImpliedSpeedKmh(roadRoute.km / (etaSeconds / 3600));
        if (roadRoute.path.length > 1) setRoutePath(roadRoute.path);
      } else {
        // OSRM unreachable — fall back to straight-line distance + assumed
        // speed, which is still better than nothing, just less precise.
        const km = haversineKm(sourceCoords, destCoords);
        setRouteDistanceKm(km);
        setRemainingDistanceKm(km);
        const initialEtaSeconds = Math.max(60, Math.round((km / ASSUMED_SPEED_KMH) * 3600));
        setTotalEtaSeconds(initialEtaSeconds);
        setTimeLeft(initialEtaSeconds);
      }
    } else {
      // Couldn't resolve one or both place names even after the broadened
      // retry — fall back to a reasonable estimate rather than leaving the
      // screen stuck on "Calculating route..." forever. If we do have a
      // device location, use that as the "current position" for live
      // deviation/ETA refinement once GPS starts reporting.
      setGeocodeFailed(true);
      setRouteDistanceKm(FALLBACK_ROUTE_KM);
      setRemainingDistanceKm(FALLBACK_ROUTE_KM);
      const fallbackEtaSeconds = Math.round((FALLBACK_ROUTE_KM / ASSUMED_SPEED_KMH) * 3600);
      setTotalEtaSeconds(fallbackEtaSeconds);
      setTimeLeft(fallbackEtaSeconds);

      if (destCoords) destCoordsRef.current = destCoords;
      else if (bias) destCoordsRef.current = bias; // last resort so live refinement has *something* to measure against
    }

    // 2) Live GPS tracking + deviation detection — native only.
    if (Platform.OS !== "web") {
      startLiveTracking(expectedRoute);
    } else {
      setGpsError("Live GPS refinement runs on the mobile app");
    }

    // 3) Fetch tracking info (unrelated to ETA, kept from original)
    try {
      await api.get("/tracking");
    } catch (e) {
      console.log("Tracking fetch error:", e);
    }
  };

  const startLiveTracking = async (expectedRoute: Coords[]) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsError("Location permission denied");
        return;
      }

      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation({
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
      });

      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 10,
        },
        (position) => {
          const coords: Coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(coords);
          updateLiveEta(coords);

          if (expectedRoute.length > 0) {
            checkDeviation(coords, expectedRoute);
          }
        }
      );
    } catch (e) {
      console.log(e);
      setGpsError("Unable to fetch location");
    }
  };

  // Refines the ETA using real measured speed + real remaining distance
  // once GPS fixes start coming in, instead of the flat ASSUMED_SPEED_KMH.
  const updateLiveEta = (coords: Coords) => {
    const now = Date.now();

    if (lastFixRef.current) {
      const hours = (now - lastFixRef.current.time) / 1000 / 3600;
      const segmentKm = haversineKm(lastFixRef.current.coords, coords);
      if (hours > 0.0005) {
        const instantSpeed = segmentKm / hours;
        speedRef.current = speedRef.current === 0 ? instantSpeed : speedRef.current * 0.6 + instantSpeed * 0.4;
        setSpeedKmh(speedRef.current);
      }
    }
    lastFixRef.current = { coords, time: now };

    if (destCoordsRef.current) {
      const remaining = haversineKm(coords, destCoordsRef.current);
      setRemainingDistanceKm(remaining);
      const speedForEta = speedRef.current > 1 ? speedRef.current : ASSUMED_SPEED_KMH;
      const refinedSeconds = Math.max(0, Math.round((remaining / speedForEta) * 3600));
      setTimeLeft(refinedSeconds);
    }
  };

  const checkDeviation = (point: Coords, route: Coords[]) => {
    const dist = distanceToRoute(point, route);
    setDistanceFromRoute(dist);

    if (dist > DEVIATION_THRESHOLD_METERS) {
      deviationStreak.current += 1;

      if (
        deviationStreak.current >= DEVIATION_CONFIRM_COUNT &&
        !alertAlreadySent.current
      ) {
        triggerDeviationAlert(point, dist);
      }
    } else {
      // Back on route — reset the streak so future deviations can re-trigger.
      deviationStreak.current = 0;
      alertAlreadySent.current = false;
      if (deviationAlertActive) {
        setDeviationAlertActive(false);
        Vibration.cancel();
      }
    }
  };

  const triggerDeviationAlert = async (point: Coords, dist: number) => {
    alertAlreadySent.current = true;
    setDeviationAlertActive(true);
    hadDeviationRef.current = true;

    // Repeating buzz pattern until dismissed — vibrate 500ms, pause 500ms, repeat.
    Vibration.vibrate([500, 500], true);

    try {
      const [storedUser, storedContacts] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("emergencyContacts"),
      ]);

      const userId = storedUser ? JSON.parse(storedUser).name : undefined;
      const parsedContacts = storedContacts ? JSON.parse(storedContacts) : {};
      const contacts = [
        parsedContacts.mother,
        parsedContacts.father,
        parsedContacts.friend,
      ].filter(Boolean);

      await api.post("/emergency/notify", {
        userId,
        journeyId: `${source || "src"}-${destination || "dst"}-${startTime || Date.now()}`,
        contacts,
        buddyName: buddyName || "Unknown",
        location: point,
        deviationDistance: dist,
      });
    } catch (e) {
      console.log("Emergency alert failed to send:", e);
    }
  };

  const dismissDeviationAlert = () => {
    setDeviationAlertActive(false);
    Vibration.cancel();
    deviationStreak.current = 0;
    alertAlreadySent.current = false;
  };

  // Shared by both the automatic "ETA reached" completion and the manual
  // "Mark Arrived Safely" button — awards a base score plus a bonus for
  // completing the trip with no route deviations along the way.
  const completeJourney = () => {
    if (journeyCompleted) return;
    setJourneyCompleted(true);
    setTimeLeft(0);
    const basePoints = 10;
    const safeRouteBonus = hadDeviationRef.current ? 0 : 5;
    setScore((prev) => prev + basePoints + safeRouteBonus);
  };

  // Countdown ticks every second; live GPS fixes (native) periodically
  // overwrite timeLeft with a more accurate figure via updateLiveEta above.
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      completeJourney();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, journeyCompleted]);

  const minutes = timeLeft !== null ? Math.floor(timeLeft / 60) : 0;
  const seconds = timeLeft !== null ? timeLeft % 60 : 0;
  const progress =
    totalEtaSeconds && timeLeft !== null
      ? ((totalEtaSeconds - timeLeft) / totalEtaSeconds) * 100
      : 0;

  const formatTime = (value: number): string => (value < 10 ? `0${value}` : String(value));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.heroFrom} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HERO ================= */}
        <LinearGradient
          colors={[COLORS.heroFrom, COLORS.heroTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heading}>Live Journey Tracking</Text>
          <Text style={styles.subHeading}>Safe travel powered by AI</Text>
        </LinearGradient>

        <View style={styles.sheet}>
          {/* DEVIATION SOS BANNER */}
          {deviationAlertActive && (
            <View style={styles.sosBanner}>
              <Ionicons name="warning" size={22} color="#FFF" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sosTitle}>Route Deviation Detected</Text>
                <Text style={styles.sosSubtitle}>
                  {distanceFromRoute
                    ? `${Math.round(distanceFromRoute)}m off expected path — emergency contact alerted`
                    : "Emergency contact alerted"}
                </Text>
              </View>
              <TouchableOpacity style={styles.sosDismiss} onPress={dismissDeviationAlert}>
                <Text style={styles.sosDismissText}>I'm Safe</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ROUTE CARD */}
          <View style={styles.routeCard}>
            <View style={styles.routeIconWrap}>
              <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.routeText}>
              {source || "Source"} → {destination || "Destination"}
            </Text>
            <View style={styles.routeMeta}>
              <Ionicons name="bus-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.routeBus}>{busNumber || "N/A"}</Text>
            </View>
          </View>

          {geocodeFailed && (
            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={14} color="#B45309" />
              <Text style={styles.noticeText}>
                Couldn't pinpoint "{source}" or "{destination}" precisely — showing an estimated
                ETA ({FALLBACK_ROUTE_KM} km assumed). Try fuller names (e.g. add city) for accuracy.
              </Text>
            </View>
          )}

          {/* LIVE MAP — see exactly where the buddy is right now, like a bus tracker */}
          <View style={styles.mapCard}>
            <View style={styles.mapHeaderRow}>
              <Text style={styles.cardTitle}>Live Location</Text>
              {currentLocation && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveBadgeDot} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              )}
            </View>

            <LiveMap
              sourceCoords={sourceMapCoords}
              destCoords={destMapCoords}
              routePath={routePath}
              currentLocation={currentLocation}
              buddyLabel={buddyName ? String(buddyName) : "Buddy"}
              primaryColor={COLORS.primary}
              successColor={COLORS.success}
              textSecondary={COLORS.textSecondary}
            />
          </View>

          {/* BUDDY */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Travel Buddy</Text>
            <Text style={styles.name}>{buddyName || "No buddy assigned"}</Text>

            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.badgeText}>Verified User</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="lock-closed-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.info}>Secure connection active</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="radio-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.info}>Live tracking enabled</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="shield-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.info}>Safe journey mode ON</Text>
            </View>
          </View>

          {/* TIMER */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Estimated Arrival</Text>

            {timeLeft === null ? (
              <Text style={styles.timerLoading}>Calculating route...</Text>
            ) : (
              <Text style={styles.timer}>
                {formatTime(minutes)}:{formatTime(seconds)}
              </Text>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="resize-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.info}>
                Distance:{" "}
                {remainingDistanceKm !== null
                  ? `${remainingDistanceKm.toFixed(1)} km`
                  : routeDistanceKm !== null
                  ? `${routeDistanceKm.toFixed(1)} km`
                  : "Calculating..."}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="locate-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.info}>
                Speed:{" "}
                {speedKmh !== null
                  ? `${speedKmh.toFixed(0)} km/h (live)`
                  : impliedSpeedKmh !== null
                  ? `~${impliedSpeedKmh.toFixed(0)} km/h (route average)`
                  : `~${ASSUMED_SPEED_KMH} km/h (estimated)`}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="analytics-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.info}>
                ETA confidence:{" "}
                {speedKmh !== null ? 95 : impliedSpeedKmh !== null ? 90 : deviationAlertActive ? 60 : 80}%
              </Text>
            </View>
          </View>

          {/* PROGRESS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Journey Progress</Text>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(Math.max(progress, 0), 100)}%` }]} />
            </View>

            <Text style={styles.percent}>{Math.round(Math.min(Math.max(progress, 0), 100))}%</Text>
          </View>

          {/* STATUS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Status</Text>

            {journeyCompleted ? (
              <>
                <View style={styles.infoRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.successText}>Journey Completed Safely</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="sparkles-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.info}>Safe arrival confirmed</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.info}>Journey Started</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="navigate-circle-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.info}>{currentLocation ? "GPS Active" : gpsError || "Locating..."}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.info}>Buddy Connected</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name={deviationAlertActive ? "warning" : "shield-checkmark-outline"}
                    size={14}
                    color={deviationAlertActive ? COLORS.sos : COLORS.textSecondary}
                  />
                  <Text style={[styles.info, deviationAlertActive && { color: COLORS.sos, fontWeight: "700" }]}>
                    {deviationAlertActive ? "Emergency Monitoring — DEVIATION ALERT" : "Emergency Monitoring ON"}
                  </Text>
                </View>
                {distanceFromRoute !== null && (
                  <View style={styles.infoRow}>
                    <Ionicons name="compass-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.info}>{Math.round(distanceFromRoute)}m from expected route</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.arrivedButton} onPress={completeJourney} activeOpacity={0.85}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.arrivedButtonText}>Mark Arrived Safely</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* AI INSIGHTS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Safety Insights</Text>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.info}>Low risk route</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.info}>Verified buddy connected</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.info}>
                Safe arrival probability {speedKmh !== null ? 95 : 90}%
              </Text>
            </View>
          </View>

          {/* SCORE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Safety Score</Text>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.info}>
              {journeyCompleted
                ? hadDeviationRef.current
                  ? "+10 pts — trip completed"
                  : "+10 pts + 5 bonus — completed with no deviations"
                : "Points are awarded once you complete this trip"}
            </Text>
          </View>

          {/* CHAT BUTTON */}
          <TouchableOpacity
            style={styles.chatButton}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: { buddyName: String(buddyName || "Buddy") },
              })
            }
          >
            <LinearGradient
              colors={[COLORS.heroFrom, COLORS.heroTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chatGradient}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#fff" />
              <Text style={styles.chatText}>Chat with Buddy</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 20 },

  hero: {
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  heading: { fontSize: 22, fontWeight: "800", textAlign: "center", color: "#FFF" },
  subHeading: { textAlign: "center", color: "rgba(255,255,255,0.75)", marginTop: 6, fontSize: 13 },

  sheet: { paddingHorizontal: 20, marginTop: -14 },

  // ================= SOS DEVIATION BANNER =================
  sosBanner: {
    backgroundColor: COLORS.sos,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: COLORS.sos,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  sosTitle: { color: "#FFF", fontWeight: "900", fontSize: 13.5 },
  sosSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 11.5, marginTop: 2 },
  sosDismiss: { backgroundColor: "#FFF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  sosDismissText: { color: COLORS.sos, fontWeight: "800", fontSize: 12 },

  // ================= ROUTE CARD =================
  routeCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  routeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  routeText: { fontSize: 14.5, fontWeight: "700", color: COLORS.textPrimary, textAlign: "center" },

  routeMeta: { flexDirection: "row", marginTop: 6, alignItems: "center", gap: 5 },
  routeBus: { color: COLORS.textSecondary, fontWeight: "700", fontSize: 12 },

  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 12,
  },
  noticeText: { color: "#B45309", fontSize: 11.5, flex: 1 },

  // ================= LIVE MAP =================
  mapCard: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  mapHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },

  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },

  liveBadgeText: {
    color: COLORS.success,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  map: {
    width: "100%",
    height: 210,
    borderRadius: 14,
  },

  mapFallback: {
    height: 150,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  mapFallbackText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  buddyMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // ================= CARDS =================
  card: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  cardTitle: { fontSize: 15.5, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 10 },

  name: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary, textAlign: "center" },

  badge: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  badgeText: { color: COLORS.success, fontWeight: "700", fontSize: 12 },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  info: { color: COLORS.textPrimary, fontWeight: "600", fontSize: 13 },

  timerLoading: { textAlign: "center", color: COLORS.textSecondary, fontSize: 14, marginVertical: 8 },

  timer: { fontSize: 36, fontWeight: "900", textAlign: "center", color: COLORS.primary },

  progressBar: { height: 10, backgroundColor: COLORS.primarySoft, borderRadius: 20, overflow: "hidden" },
  progressFill: { height: 10, backgroundColor: COLORS.primary, borderRadius: 20 },
  percent: { textAlign: "center", marginTop: 8, color: COLORS.textSecondary, fontWeight: "600" },

  score: { fontSize: 36, fontWeight: "900", textAlign: "center", color: COLORS.primary },
  successText: { fontSize: 15, fontWeight: "700", color: COLORS.success },

  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },

  arrivedButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    paddingVertical: 12,
  },

  arrivedButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 13,
  },

  chatButton: { marginTop: 20, borderRadius: 18, overflow: "hidden" },
  chatGradient: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  chatText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});