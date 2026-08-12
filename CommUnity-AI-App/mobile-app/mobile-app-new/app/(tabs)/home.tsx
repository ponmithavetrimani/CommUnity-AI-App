import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";

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

type SafePlace = {
  id: string;
  name: string;
  address: string;
  kind: "police" | "hospital" | "transit";
  distanceKm: number;
};

const PLACE_STYLE: Record<SafePlace["kind"], { icon: any; color: string; bg: string }> = {
  police: { icon: "shield-outline", color: COLORS.primary, bg: COLORS.primarySoft },
  hospital: { icon: "medkit-outline", color: "#D6295E", bg: "#FDEAF0" },
  transit: { icon: "train-outline", color: "#8A6D3B", bg: "#F6EFE2" },
};

const FALLBACK_PLACES: SafePlace[] = [
  { id: "f1", name: "Police Station", address: "Anna Nagar Police Station", kind: "police", distanceKm: 1.2 },
  { id: "f2", name: "Hospital", address: "Apollo Hospital", kind: "hospital", distanceKm: 2.3 },
  { id: "f3", name: "Metro Station", address: "Anna Nagar East Metro", kind: "transit", distanceKm: 0.9 },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export default function HomePage() {
  const [userName, setUserName] = useState<string>("Ponmi");

  const [safePlaces, setSafePlaces] = useState<SafePlace[]>(FALLBACK_PLACES);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [placesExpanded, setPlacesExpanded] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  const scrollRef = useRef<ScrollView | null>(null);
  const placesSectionY = useRef(0);

  const watchSubRef = useRef<Location.LocationSubscription | null>(null);
  const lastFetchCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const MOVE_REFETCH_METERS = 400;

  useEffect(() => {
    loadUser();
    loadNearbySafePlaces();
    startSosPulse();
    startLiveLocationWatch();

    return () => {
      watchSubRef.current?.remove();
    };
  }, []);

  const startLiveLocationWatch = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      watchSubRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 20000, distanceInterval: 150 },
        (position) => {
          const { latitude, longitude } = position.coords;
          const last = lastFetchCoordsRef.current;
          const movedFar =
            !last || haversineKm(last.latitude, last.longitude, latitude, longitude) * 1000 > MOVE_REFETCH_METERS;
          if (movedFar) {
            loadNearbySafePlaces(latitude, longitude);
          }
        }
      );
    } catch (e) {
      console.log("Location watch failed to start:", e);
    }
  };

  const startSosPulse = () => {
    const makeLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    makeLoop(pulse1, 0).start();
    makeLoop(pulse2, 900).start();
  };

  const loadUser = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const data = JSON.parse(user);
        setUserName(data.name || "Ponmi");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const loadNearbySafePlaces = async (knownLat?: number, knownLon?: number) => {
    setPlacesLoading(true);
    setLocationError(null);
    try {
      let latitude = knownLat;
      let longitude = knownLon;

      if (latitude == null || longitude == null) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied — showing sample places");
          setSafePlaces(FALLBACK_PLACES);
          setPlacesLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      lastFetchCoordsRef.current = { latitude, longitude };

      const query = `[out:json][timeout:20];(
        nwr["amenity"="police"](around:6000,${latitude},${longitude});
        nwr["amenity"="hospital"](around:6000,${latitude},${longitude});
        nwr["railway"="station"](around:6000,${latitude},${longitude});
        nwr["railway"="subway_entrance"](around:6000,${latitude},${longitude});
      );out center 80;`;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
      });
      const data = await response.json();

      const byKind: Record<SafePlace["kind"], SafePlace[]> = {
        police: [],
        hospital: [],
        transit: [],
      };

      (data.elements || [])
        .filter((el: any) => el.tags && el.tags.name)
        .forEach((el: any) => {
          const kind: SafePlace["kind"] =
            el.tags.amenity === "police"
              ? "police"
              : el.tags.amenity === "hospital"
              ? "hospital"
              : "transit";

          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (lat == null || lon == null) return;

          byKind[kind].push({
            id: `${el.type}-${el.id}`,
            name:
              kind === "police" ? "Police Station" : kind === "hospital" ? "Hospital" : "Metro / Station",
            address: el.tags.name,
            kind,
            distanceKm: haversineKm(latitude, longitude, lat, lon),
          });
        });

      (Object.keys(byKind) as SafePlace["kind"][]).forEach((k) =>
        byKind[k].sort((a, b) => a.distanceKm - b.distanceKm)
      );

      const perCategoryCap = 4;
      const merged = [
        ...byKind.police.slice(0, perCategoryCap),
        ...byKind.hospital.slice(0, perCategoryCap),
        ...byKind.transit.slice(0, perCategoryCap),
      ].sort((a, b) => a.distanceKm - b.distanceKm);

      if (merged.length > 0) {
        setSafePlaces(merged);
      } else {
        setLocationError("No safe places found nearby — showing sample places");
        setSafePlaces(FALLBACK_PLACES);
      }
    } catch (e) {
      console.log("Nearby safe places fetch failed:", e);
      setLocationError("Couldn't reach maps service — showing sample places");
      setSafePlaces(FALLBACK_PLACES);
    } finally {
      setPlacesLoading(false);
    }
  };

  const visiblePlaces = placesExpanded ? safePlaces.slice(0, 10) : safePlaces.slice(0, 3);

  const ring = (val: Animated.Value) => ({
    opacity: val.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
    transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
  });

  const initial = userName?.trim()?.[0]?.toUpperCase() || "P";

  const goToRiskDetail = () => router.push("/tracking");
  const goToGpsDetail = () => router.push("/tracking");
  const goToSafePlaces = () => {
    setPlacesExpanded(true);
    scrollRef.current?.scrollTo({ y: placesSectionY.current, animated: true });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.heroFrom} barStyle="light-content" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HERO BANNER ================= */}
        <LinearGradient
          colors={[COLORS.heroFrom, COLORS.heroTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>Good Morning</Text>
              <Text style={styles.heroName}>{userName}</Text>
            </View>

            <View style={styles.heroIconsRow}>
              <TouchableOpacity
                style={styles.heroIconBtn}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons name="notifications-outline" size={18} color="#FFF" />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={() => router.push("/profile")}
              >
                <Text style={styles.avatarText}>{initial}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.ringWrap}>
            <View style={styles.ring}>
              <View style={styles.ringInner}>
                <Ionicons name="shield-checkmark" size={22} color="#FFF" />
                <Text style={styles.ringPercent}>98%</Text>
                <Text style={styles.ringLabel}>Safety Score</Text>
              </View>
            </View>

            <View style={styles.heroStatusPill}>
              <Ionicons name="checkmark-circle" size={13} color="#FFF" />
              <Text style={styles.heroStatusPillText}>Very Strong · Safe Zone</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ================= WHITE SHEET ================= */}
        <View style={styles.sheet}>
          {/* STAT ROW */}
          <View style={styles.statRow}>
            <TouchableOpacity style={styles.statCard} onPress={goToRiskDetail} activeOpacity={0.75}>
              <View style={[styles.statIconWrap, { backgroundColor: COLORS.successSoft }]}>
                <Ionicons name="shield-checkmark-outline" size={17} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>LOW</Text>
              <Text style={styles.statLabel}>Risk Level</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={goToGpsDetail} activeOpacity={0.75}>
              <View style={[styles.statIconWrap, { backgroundColor: "#E7F1FE" }]}>
                <Ionicons name="locate-outline" size={17} color="#2563EB" />
              </View>
              <Text style={styles.statValue}>Active</Text>
              <Text style={styles.statLabel}>GPS Status</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={goToSafePlaces} activeOpacity={0.75}>
              <View style={[styles.statIconWrap, { backgroundColor: COLORS.primarySoft }]}>
                <Ionicons name="business-outline" size={17} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{safePlaces.length}</Text>
              <Text style={styles.statLabel}>Safe Places</Text>
            </TouchableOpacity>
          </View>

          {/* QUICK ACCESS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Quick Access</Text>
            <Text style={styles.viewAllText}>View All</Text>
          </View>

          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickItem} onPress={() => router.push("/journey")}>
              <View style={styles.quickAvatar}>
                <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.quickLabel}>Journey</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickItem} onPress={() => router.push("/buddy")}>
              <View style={styles.quickAvatar}>
                <Ionicons name="people-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.quickLabel}>Buddy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickItem} onPress={() => router.push("/tracking")}>
              <View style={styles.quickAvatar}>
                <Ionicons name="pulse-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.quickLabel}>Tracking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickItem} onPress={() => router.push("/profile")}>
              <View style={styles.quickAvatar}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.quickLabel}>Profile</Text>
            </TouchableOpacity>
          </View>

          {/* NEARBY SAFE PLACES */}
          <View
            onLayout={(e) => {
              placesSectionY.current = e.nativeEvent.layout.y;
            }}
            style={styles.sectionHeaderRow}
          >
            <Text style={styles.sectionLabel}>Nearby Safe Places</Text>
            <TouchableOpacity onPress={() => setPlacesExpanded((v) => !v)}>
              <Text style={styles.viewAllText}>{placesExpanded ? "Show less" : "View all"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.placesCard}>
            {locationError && (
              <View style={styles.placesNotice}>
                <Ionicons name="information-circle-outline" size={14} color="#B45309" />
                <Text style={styles.placesNoticeText}>{locationError}</Text>
              </View>
            )}

            {placesLoading ? (
              <View style={styles.placesLoadingBox}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.placesLoadingText}>Finding safe places near you</Text>
              </View>
            ) : (
              visiblePlaces.map((place, idx) => {
                const style = PLACE_STYLE[place.kind];
                return (
                  <TouchableOpacity
                    key={place.id}
                    style={[styles.placeRow, idx === 0 && { borderTopWidth: 0 }]}
                    onPress={() =>
                      router.push({
                        pathname: "/sos",
                        params: { destination: place.address },
                      })
                    }
                  >
                    <View style={[styles.placeIconContainer, { backgroundColor: style.bg }]}>
                      <Ionicons name={style.icon} size={18} color={style.color} />
                    </View>
                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName}>{place.name}</Text>
                      <Text style={styles.placeAddress}>{place.address}</Text>
                    </View>
                    <View style={styles.distancePill}>
                      <Text style={styles.distanceText}>{formatDistance(place.distanceKm)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {!placesLoading && (
              <TouchableOpacity style={styles.refreshRow} onPress={() => loadNearbySafePlaces()}>
                <Ionicons name="refresh-outline" size={13} color={COLORS.primary} />
                <Text style={styles.refreshText}>Refresh nearby places</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* ================= FLOATING SOS BUTTON ================= */}
      <View style={styles.sosContainer} pointerEvents="box-none">
        <Animated.View style={[styles.sosPulseRing, ring(pulse1)]} />
        <Animated.View style={[styles.sosPulseRing, ring(pulse2)]} />

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/sos")}
          style={styles.sosButtonWrap}
        >
          <LinearGradient
            colors={[COLORS.sos, COLORS.heroFrom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sosButton}
          >
            <Ionicons name="alert" size={22} color="#FFF" />
            <Text style={styles.sosText}>SOS</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.sosCaption}>Tap for help</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  hero: {
    paddingTop: 55,
    paddingHorizontal: 22,
    paddingBottom: 34,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  heroEyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
  },

  heroName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },

  heroIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  notifDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFD166",
  },

  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },

  avatarText: { color: "#FFF", fontWeight: "800", fontSize: 15 },

  ringWrap: {
    alignItems: "center",
    marginTop: 26,
  },

  ring: {
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 7,
    borderColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  ringInner: {
    justifyContent: "center",
    alignItems: "center",
  },

  ringPercent: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
  },

  ringLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 2,
  },

  heroStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 16,
  },

  heroStatusPillText: { color: "#FFF", fontSize: 12, fontWeight: "700" },

  sheet: {
    paddingHorizontal: 20,
    marginTop: -18,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  statValue: { fontSize: 14, fontWeight: "800", color: COLORS.textPrimary },
  statLabel: { fontSize: 10.5, color: COLORS.textSecondary, marginTop: 2 },

  sectionHeaderRow: {
    marginTop: 26,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionLabel: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  viewAllText: { color: COLORS.primary, fontSize: 12.5, fontWeight: "700" },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  quickItem: {
    alignItems: "center",
    width: "23%",
  },

  quickAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  quickLabel: { fontSize: 11.5, fontWeight: "700", color: COLORS.textPrimary },

  placesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  placesNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 12,
  },

  placesNoticeText: { color: "#B45309", fontSize: 12, flex: 1 },

  placesLoadingBox: { alignItems: "center", paddingVertical: 26 },

  placesLoadingText: {
    marginTop: 10,
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 12.5,
  },

  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1E9EC",
  },

  placeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  placeInfo: { flex: 1, marginLeft: 12 },
  placeName: { fontSize: 13.5, fontWeight: "700", color: COLORS.textPrimary },
  placeAddress: { marginTop: 2, color: COLORS.textSecondary, fontSize: 11.5 },

  distancePill: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  distanceText: { color: COLORS.primary, fontWeight: "700", fontSize: 11.5 },

  refreshRow: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1E9EC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  refreshText: { color: COLORS.primary, fontWeight: "700", fontSize: 12 },

  sosContainer: {
    position: "absolute",
    bottom: 30,
    right: 22,
    alignItems: "center",
  },

  sosButtonWrap: {
    shadowColor: COLORS.sos,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },

  sosButton: {
    width: 66,
    height: 66,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
  },

  sosPulseRing: {
    position: "absolute",
    top: 0,
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: COLORS.sos,
  },

  sosText: {
    color: "#FFF",
    fontSize: 10.5,
    fontWeight: "800",
    marginTop: 3,
    letterSpacing: 0.6,
  },

  sosCaption: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
});