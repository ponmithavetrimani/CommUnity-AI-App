import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ================= DESIGN TOKENS =================
// Shared with HomePage/ChatPage: deep maroon/wine gradient hero, clean white
// surfaces, soft pink accents.
const COLORS = {
  bg: "#F8F5F6",
  surface: "#FFFFFF",
  heroFrom: "#4A0E2A",
  heroTo: "#8B1E4A",
  primary: "#7A1B41",
  primarySoft: "#FBEAF0",
  textPrimary: "#20141C",
  textSecondary: "#8A7C86",
};

export default function WelcomePage() {
  return (
    <View style={styles.container}>

      {/* Background circles */}
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <LinearGradient
        colors={[COLORS.heroFrom, COLORS.heroTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Ionicons name="shield-checkmark" size={80} color="#fff" />

        <Text style={styles.title}>CommUnity AI</Text>

        <Text style={styles.subtitle}>
          Safe Travel • Smart Buddy • AI Protection
        </Text>
      </LinearGradient>

      {/* Card Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          👋 Welcome to Safe Journey App
        </Text>

        <Text style={styles.cardText}>
          Travel safely with AI-powered buddy matching, live tracking, and SOS protection system.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/details")}
        >
          <LinearGradient
            colors={[COLORS.heroFrom, COLORS.heroTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    padding: 20,
  },

  bgCircleTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primarySoft,
    top: -60,
    right: -60,
  },

  bgCircleBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primarySoft,
    bottom: -80,
    left: -80,
  },

  header: {
    borderRadius: 30,
    padding: 35,
    alignItems: "center",
    shadowColor: "#5A3A46",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    marginTop: 15,
  },

  subtitle: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },

  card: {
    marginTop: 25,
    backgroundColor: COLORS.surface,
    padding: 22,
    borderRadius: 25,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  cardText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  button: {
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});