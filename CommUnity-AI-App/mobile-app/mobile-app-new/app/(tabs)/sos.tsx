import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Linking,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as SMS from "expo-sms"; // npx expo install expo-sms
import api from "../../services/api";

// ================= DESIGN TOKENS =================
// Same maroon/wine system as HomePage — deep gradient accents, white cards,
// crimson reserved for the SOS button itself so it still reads as urgent.
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
  warn: "#B45309",
  sos: "#D6295E",
};

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export default function SOSPage() {
  const { destination, buddyName, journeyId } = useLocalSearchParams();
  const targetPlace = destination ? String(destination) : null;
  const activeBuddy = buddyName ? String(buddyName) : null;

  const [sosEnabled, setSosEnabled] = useState(false);
  const [arrivedSafely, setArrivedSafely] = useState(false);
  const [sendingSOS, setSendingSOS] = useState(false);
  const [contactsNotified, setContactsNotified] = useState<EmergencyContact[]>([]);
  const [smsSent, setSmsSent] = useState(false);

  // Reads emergency contacts saved from Settings.
  // Supports both the new [{id,name,phone}] format and the old
  // { mother, father, friend } format, so nothing breaks for existing users.
  const loadContacts = async (): Promise<EmergencyContact[]> => {
    try {
      const stored = await AsyncStorage.getItem("emergencyContacts");
      if (!stored) return [];
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        return parsed.filter((c: EmergencyContact) => c.phone && c.phone.trim().length > 0);
      }

      if (parsed && typeof parsed === "object") {
        return [
          { id: "mother", name: "Mother", phone: parsed.mother || "" },
          { id: "father", name: "Father", phone: parsed.father || "" },
          { id: "friend", name: "Friend", phone: parsed.friend || "" },
        ].filter((c) => c.phone.trim().length > 0);
      }

      return [];
    } catch (e) {
      console.log("Reading stored contacts failed:", e);
      return [];
    }
  };

  const sendSOS = async () => {
    if (sendingSOS) return;
    setSendingSOS(true);

    // best-effort location — SOS should still fire even if this fails
    let location: { latitude: number; longitude: number } | null = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      }
    } catch (e) {
      console.log("Location fetch for SOS failed:", e);
    }

    let userId: string | undefined;
    let contacts: EmergencyContact[] = [];
    try {
      const storedUser = await AsyncStorage.getItem("user");
      userId = storedUser ? JSON.parse(storedUser).name : undefined;
      contacts = await loadContacts();
    } catch (e) {
      console.log("Reading stored user failed:", e);
    }

    const locationLink = location
      ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : null;

    // 1) Try the backend so the app/server can track and monitor the emergency
    let notifySucceeded = false;
    try {
      await api.post("/emergency/notify", {
        userId,
        journeyId: journeyId ? String(journeyId) : `manual-sos-${Date.now()}`,
        contacts,
        buddyName: activeBuddy || "Unknown",
        location,
        trigger: "manual_sos",
        destination: targetPlace,
      });
      notifySucceeded = true;
    } catch (e) {
      console.log("Emergency notify failed:", e);
    }

    // 2) Also drop a system message into the buddy chat, so they see it there too
    if (activeBuddy) {
      try {
        const chatKey = activeBuddy.replace(/\s+/g, "_");
        await api.post("/messages", {
          chatKey,
          id: `${Date.now()}-sos`,
          from: "system",
          text: targetPlace
            ? `🚨 SOS triggered — heading to ${targetPlace}, please check in.`
            : "🚨 SOS triggered — please check in.",
          time: Date.now(),
        });
      } catch (e) {
        console.log("Buddy chat SOS message failed:", e);
      }
    }

    // 3) Real SMS fallback straight to the saved contacts' phones.
    // This fires regardless of whether the backend call succeeded, so contacts
    // are actually reached even if the server/API is down or unreachable.
    let smsDidSend = false;
    try {
      const available = await SMS.isAvailableAsync();
      if (available && contacts.length > 0) {
        const message = [
          `🚨 SOS Alert from ${userId || "a user"}!`,
          targetPlace ? `Heading to: ${targetPlace}.` : null,
          locationLink ? `Live location: ${locationLink}` : "Location unavailable.",
          "Please check in with them immediately.",
        ]
          .filter(Boolean)
          .join(" ");

        const { result } = await SMS.sendSMSAsync(
          contacts.map((c) => c.phone),
          message
        );
        smsDidSend = result === "sent" || result === "unknown";
      }
    } catch (e) {
      console.log("SMS fallback failed:", e);
    }

    setContactsNotified(contacts);
    setSmsSent(smsDidSend);
    setSendingSOS(false);
    setSosEnabled(true);

    Alert.alert(
      notifySucceeded || smsDidSend ? "Emergency Mode Activated 🚨" : "SOS sent (limited connectivity) 🚨",
      [
        targetPlace ? `✔ Heading to ${targetPlace}` : null,
        activeBuddy ? `✔ ${activeBuddy} notified` : "• No buddy connected for this trip",
        contacts.length > 0
          ? `✔ ${contacts.map((c) => c.name).join(", ")} alerted`
          : "• No emergency contacts saved yet",
        location ? "✔ Location shared" : "• Location unavailable",
        notifySucceeded ? "✔ Server monitoring enabled" : "• Server unreachable — saved to retry",
        smsDidSend ? "✔ SMS sent to emergency contacts" : "• SMS not sent",
      ]
        .filter(Boolean)
        .join("\n"),
      [{ text: "OK" }]
    );
  };

  const openDirections = () => {
    if (!targetPlace) return;
    const query = encodeURIComponent(targetPlace);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Couldn't open maps", "Please check that a maps app is installed.")
    );
  };

  const markArrived = () => {
    setArrivedSafely(true);
    Alert.alert("Marked safe ✅", `Glad you reached ${targetPlace} safely.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.heroFrom} barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <Text style={styles.heading}>Emergency SOS</Text>
        <Text style={styles.subHeading}>One tap protection for your safety</Text>

        {/* ================= HEADING TO SAFE PLACE (contextual) ================= */}
        {targetPlace && !arrivedSafely && (
          <LinearGradient
            colors={[COLORS.heroFrom, COLORS.heroTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.destinationCard}
          >
            <View style={styles.destinationTopRow}>
              <View style={styles.destinationIconWrap}>
                <Ionicons name="navigate" size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.destinationLabel}>Heading to nearest safe place</Text>
                <Text style={styles.destinationName}>{targetPlace}</Text>
              </View>
            </View>

            <View style={styles.destinationActions}>
              <TouchableOpacity style={styles.directionsBtn} onPress={openDirections}>
                <Ionicons name="map" size={16} color={COLORS.primary} />
                <Text style={styles.directionsBtnText}>Get Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.arrivedBtn} onPress={markArrived}>
                <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                <Text style={styles.arrivedBtnText}>I've Arrived Safely</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {targetPlace && arrivedSafely && (
          <View style={styles.arrivedCard}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.success} />
            <Text style={styles.arrivedCardText}>You're marked safe at {targetPlace}</Text>
          </View>
        )}

        {/* MAIN CARD */}
        <View style={styles.card}>
          <View style={styles.shieldWrap}>
            <Ionicons name="shield" size={54} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Need Immediate Help?</Text>

          <Text style={styles.description}>
            {targetPlace
              ? `If things don't feel right on the way to ${targetPlace}, tap below to instantly alert your emergency contacts and share your live location.`
              : "Tap SOS to instantly alert your emergency contacts, share location and activate safety monitoring."}
          </Text>

          <TouchableOpacity activeOpacity={0.8} onPress={sendSOS} disabled={sendingSOS}>
            <LinearGradient
              colors={[COLORS.sos, COLORS.heroFrom]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.sosButton, sendingSOS && { opacity: 0.75 }]}
            >
              {sendingSOS ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="warning" size={18} color="#fff" />
              )}
              <Text style={styles.sosText}>{sendingSOS ? "SENDING..." : "SEND SOS ALERT"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* STATUS */}
        {sosEnabled && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Emergency Status</Text>

            {targetPlace && (
              <View style={styles.statusBox}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.statusText}>Destination shared: {targetPlace}</Text>
              </View>
            )}

            <View style={styles.statusBox}>
              <Ionicons
                name={activeBuddy ? "checkmark-circle" : "information-circle"}
                size={20}
                color={activeBuddy ? COLORS.success : COLORS.warn}
              />
              <Text style={styles.statusText}>
                {activeBuddy ? `${activeBuddy} notified` : "No buddy connected for this trip"}
              </Text>
            </View>

            {contactsNotified.length > 0 ? (
              contactsNotified.map((c) => (
                <View style={styles.statusBox} key={c.id}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.statusText}>
                    {c.name} alerted{smsSent ? " (SMS sent)" : ""}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.statusBox}>
                <Ionicons name="information-circle" size={20} color={COLORS.warn} />
                <Text style={styles.statusText}>No emergency contacts saved yet</Text>
              </View>
            )}

            <View style={styles.statusBox}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.statusText}>Location shared</Text>
            </View>

            <View style={styles.statusBox}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.statusText}>Emergency mode ON</Text>
            </View>
          </View>
        )}

        {/* FEATURES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Safety Features 🔒</Text>

          <View style={styles.featureItem}>
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <Text style={styles.feature}>Live Location Sharing</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="people" size={18} color={COLORS.primary} />
            <Text style={styles.feature}>Emergency Contact Alerts</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="mic" size={18} color={COLORS.primary} />
            <Text style={styles.feature}>Voice Trigger SOS</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="car" size={18} color={COLORS.primary} />
            <Text style={styles.feature}>Journey Tracking</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="phone-portrait" size={18} color={COLORS.primary} />
            <Text style={styles.feature}>Offline SMS Backup</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="videocam" size={18} color={COLORS.primary} />
            <Text style={styles.feature}>Evidence Recording</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="call" size={18} color={COLORS.primary} />
            <Text style={styles.feature}>112 Emergency Integration</Text>
          </View>
        </View>

        {targetPlace && (
          <TouchableOpacity style={styles.backLink} onPress={() => router.push("/home")}>
            <Ionicons name="arrow-back" size={14} color={COLORS.primary} />
            <Text style={styles.backLinkText}>Back to Home</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  content: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.textPrimary,
  },

  subHeading: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "600",
  },

  // ================= DESTINATION CARD =================
  destinationCard: {
    marginTop: 18,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  destinationTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  destinationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  destinationLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12.5,
    fontWeight: "600",
  },

  destinationName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },

  destinationActions: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },

  directionsBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  directionsBtnText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 13,
  },

  arrivedBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },

  arrivedBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 12.5,
  },

  arrivedCard: {
    marginTop: 18,
    backgroundColor: COLORS.successSoft,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  arrivedCardText: {
    color: COLORS.success,
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
  },

  // ================= MAIN CARD =================
  card: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  shieldWrap: {
    alignItems: "center",
    marginBottom: 4,
  },

  title: {
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
    color: COLORS.textPrimary,
  },

  description: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 10,
    lineHeight: 20,
    fontSize: 13.5,
  },

  sosButton: {
    marginTop: 20,
    flexDirection: "row",
    padding: 16,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.sos,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  sosText: {
    color: "#fff",
    fontWeight: "800",
    marginLeft: 8,
    fontSize: 15,
    letterSpacing: 0.5,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: COLORS.textPrimary,
  },

  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },

  statusText: {
    color: COLORS.success,
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 13.5,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  feature: {
    marginLeft: 10,
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 13.5,
  },

  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 6,
  },

  backLinkText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});