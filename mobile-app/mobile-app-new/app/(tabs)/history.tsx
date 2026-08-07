import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ================= DESIGN TOKENS =================
// Same maroon/wine system as HomePage — deep gradient hero, white cards,
// success green kept for "Safe Arrival" as a trust signal.
const COLORS = {
  bg: "#F8F5F6",
  surface: "#FFFFFF",
  heroFrom: "#4A0E2A",
  heroTo: "#8B1E4A",
  primary: "#7A1B41",
  primarySoft: "#FBEAF0",
  textPrimary: "#20141C",
  textSecondary: "#8A7C86",
  border: "#F1E9EC",
  success: "#12B76A",
  successSoft: "#E7F9EF",
};

export default function HistoryPage() {
  const journeys = [
    {
      source: "Tambaram",
      destination: "T.Nagar",
      transport: "Bus 21M",
      buddy: "Priya R.",
      date: "14 June 2026",
      duration: "42 mins",
      score: "+10",
    },
    {
      source: "Chennai Central",
      destination: "Airport",
      transport: "Metro",
      buddy: "Kavya S.",
      date: "12 June 2026",
      duration: "35 mins",
      score: "+10",
    },
    {
      source: "Coimbatore",
      destination: "Gandhipuram",
      transport: "Bus S23",
      buddy: "Nisha P.",
      date: "10 June 2026",
      duration: "28 mins",
      score: "+10",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* ================= HERO HEADER ================= */}
        <LinearGradient
          colors={[COLORS.heroFrom, COLORS.heroTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerIconWrap}>
            <Ionicons name="time-outline" size={22} color="#FFF" />
          </View>
          <Text style={styles.heading}>Journey History</Text>
          <Text style={styles.subHeading}>
            Every safe trip strengthens your journey
          </Text>
        </LinearGradient>

        {/* JOURNEYS */}
        {journeys.map((j, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.route}>
              📍 {j.source} → {j.destination}
            </Text>

            <View style={styles.row}>
              <Text style={styles.info}>🚌 {j.transport}</Text>
              <Text style={styles.info}>🤝 {j.buddy}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.info}>📅 {j.date}</Text>
              <Text style={styles.info}>⏱ {j.duration}</Text>
            </View>

            <View style={styles.safeBox}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.safeText}> Safe Arrival Confirmed</Text>
            </View>

            <Text style={styles.points}>⭐ {j.score} Safety Points</Text>
          </View>
        ))}

        {/* STATS */}
        <View style={styles.card}>
          <Text style={styles.title}>Community Stats</Text>

          <Text style={styles.stat}>🚶 Total Journeys : 32</Text>
          <Text style={styles.stat}>⭐ Safety Score : 147</Text>
          <Text style={styles.stat}>🟢 Success Rate : 100%</Text>
          <Text style={styles.stat}>🤝 Buddies : 21</Text>
          <Text style={styles.stat}>🚨 SOS Handled : 5</Text>
        </View>

        {/* ACHIEVEMENTS */}
        <View style={styles.card}>
          <Text style={styles.title}>Achievements</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>🥇 Trusted Traveler</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>🛡 Safety Champion</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>👭 Community Guardian</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>🚀 30+ Safe Trips</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  header: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },

  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },

  subHeading: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  route: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  info: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  safeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successSoft,
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
  },

  safeText: {
    color: COLORS.success,
    fontWeight: "700",
    marginLeft: 5,
    fontSize: 13,
  },

  points: {
    marginTop: 12,
    textAlign: "center",
    fontWeight: "800",
    color: COLORS.primary,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 15,
    color: COLORS.textPrimary,
  },

  stat: {
    marginBottom: 10,
    color: COLORS.textSecondary,
    fontSize: 13.5,
    fontWeight: "500",
  },

  badge: {
    backgroundColor: COLORS.primarySoft,
    padding: 14,
    borderRadius: 15,
    marginBottom: 10,
  },

  badgeText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});