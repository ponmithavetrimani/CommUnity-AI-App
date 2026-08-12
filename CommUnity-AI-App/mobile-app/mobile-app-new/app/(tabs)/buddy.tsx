import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Same tokens as home.tsx / _layout.tsx — deep maroon/wine gradient family.
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
};

export default function BuddyPage() {
  const {
    source,
    destination,
    transport,
    busNumber,
    startTime,
  } = useLocalSearchParams();

  // Sample buddy data - moved inside component
  const buddies = [
    {
      id: 1,
      name: "Priya Sharma",
      match: "95%",
      trustScore: "98%",
      journeys: "24",
      distance: "2.3 km away",
    },
    {
      id: 2,
      name: "Ananya Reddy",
      match: "88%",
      trustScore: "96%",
      journeys: "18",
      distance: "3.1 km away",
    },
    {
      id: 3,
      name: "Meera Krishnan",
      match: "92%",
      trustScore: "97%",
      journeys: "21",
      distance: "1.8 km away",
    },
  ];

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const goToTracking = (name: string) => {
    router.push({
      pathname: "/(tabs)/tracking",
      params: {
        source,
        destination,
        transport,
        busNumber,
        startTime,
        buddyName: name,
      },
    });
  };

  const connectBuddy = (name: string) => {
    // Alert.alert doesn't render on react-native-web — it silently no-ops,
    // so the "OK" onPress (and therefore navigation) never fires on web.
    // Navigate directly on web; keep the native confirmation on iOS/Android.
    if (Platform.OS === "web") {
      goToTracking(name);
      return;
    }

    Alert.alert(
      "Connection Successful",
      `Connected with ${name}`,
      [
        {
          text: "OK",
          onPress: () => goToTracking(name),
        },
      ]
    );
  };

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
          <Text style={styles.heading}>AI Buddy Match</Text>
          <Text style={styles.subHeading}>Verified safe travellers on your route</Text>
        </LinearGradient>

        {/* ================= WHITE SHEET ================= */}
        <View style={styles.sheet}>
          {/* ROUTE CARD */}
          <View style={styles.routeCard}>
            <View style={styles.routeIconWrap}>
              <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.routeText}>
                {source || "Source"} → {destination || "Destination"}
              </Text>
              <View style={styles.routeMeta}>
                <Ionicons name="bus-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.routeBus}>{busNumber || "N/A"}</Text>
              </View>
            </View>
          </View>

          {/* BUDDY LIST */}
          {buddies.map((buddy, index) => (
            <View key={buddy.id || index} style={styles.card}>
              <LinearGradient
                colors={[COLORS.heroFrom, COLORS.heroTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarCircle}
              >
                <Text style={styles.avatarInitials}>{initials(buddy.name)}</Text>
              </LinearGradient>

              <Text style={styles.name}>{buddy.name}</Text>

              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified User</Text>
              </View>

              {/* stats */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{buddy.match}</Text>
                  <Text style={styles.statLabel}>Match</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{buddy.trustScore}</Text>
                  <Text style={styles.statLabel}>Trust</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{buddy.journeys}</Text>
                  <Text style={styles.statLabel}>Trips</Text>
                </View>
              </View>

              {/* info */}
              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <Ionicons name="bus-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.infoText}>{transport || "Bus"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.infoText}>{startTime || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.infoText}>{buddy.distance}</Text>
                </View>
              </View>

              {/* button */}
              <TouchableOpacity onPress={() => connectBuddy(buddy.name)} activeOpacity={0.9}>
                <LinearGradient
                  colors={[COLORS.heroFrom, COLORS.heroTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  <Ionicons name="shield-checkmark-outline" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Connect Securely</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
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

  // ================= HERO =================
  hero: {
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
  },

  subHeading: {
    marginTop: 6,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13.5,
  },

  // ================= WHITE SHEET =================
  sheet: {
    paddingHorizontal: 20,
    marginTop: -14,
  },

  // ================= ROUTE CARD =================
  routeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  routeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },

  routeText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  routeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 5,
  },

  routeBus: {
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },

  // ================= BUDDY CARD =================
  card: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 20,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  avatarCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  avatarInitials: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "800",
  },

  name: {
    textAlign: "center",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 12,
    color: COLORS.textPrimary,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: "center",
    gap: 5,
  },

  verifiedText: {
    color: COLORS.success,
    fontWeight: "700",
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 10,
  },

  statBox: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  infoBox: {
    marginTop: 14,
    backgroundColor: COLORS.bg,
    padding: 14,
    borderRadius: 14,
    gap: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  infoText: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 12.5,
  },

  button: {
    marginTop: 16,
    padding: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14.5,
  },
});