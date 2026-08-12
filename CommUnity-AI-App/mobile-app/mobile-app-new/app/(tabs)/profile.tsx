import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// ================= DESIGN TOKENS =================
// Same maroon/wine system as HomePage — deep gradient hero, white cards,
// crimson reserved for the warning/emergency icon.
const COLORS = {
  bg: "#F8F5F6",
  surface: "#FFFFFF",
  heroFrom: "#4A0E2A",
  heroTo: "#8B1E4A",
  primary: "#7A1B41",
  primarySoft: "#FBEAF0",
  textPrimary: "#20141C",
  textSecondary: "#8A7C86",
  danger: "#D6295E",
};

// Define the Profile type
interface Profile {
  name: string;
  age: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  language: string;
  emergencyContact: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    language: "",
    emergencyContact: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await AsyncStorage.getItem("userProfile");
        if (data) {
          const parsedData = JSON.parse(data);
          setProfile(parsedData);
        }
      } catch (error) {
        console.log("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.heroFrom} barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ================= HERO HEADER ================= */}
        <LinearGradient
          colors={[COLORS.heroFrom, COLORS.heroTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatar}>👩</Text>
          </View>
          <Text style={styles.name}>{profile.name || "User"}</Text>
          <Text style={styles.sub}>Community Guardian Member</Text>
        </LinearGradient>

        {/* PERSONAL DETAILS */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={styles.titleIconWrap}>
              <Ionicons name="person" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Personal Details</Text>
          </View>

          <Text style={styles.info}>📧 {profile.email || "Not set"}</Text>
          <Text style={styles.info}>📱 {profile.phone || "Not set"}</Text>
          <Text style={styles.info}>🎂 Age: {profile.age || "Not set"}</Text>
          <Text style={styles.info}>📍 {profile.city || "Not set"}</Text>
          <Text style={styles.info}>🌍 {profile.country || "Not set"}</Text>
          <Text style={styles.info}>🗣 {profile.language || "Not set"}</Text>
        </View>

        {/* EMERGENCY */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={[styles.titleIconWrap, { backgroundColor: "#FDEAF0" }]}>
              <Ionicons name="warning" size={16} color={COLORS.danger} />
            </View>
            <Text style={styles.title}>Emergency Contact</Text>
          </View>

          <View style={styles.badgeBox}>
            <MaterialCommunityIcons name="phone" size={18} color={COLORS.primary} />
            <Text style={styles.badgeText}>
              {profile.emergencyContact || "Not set"}
            </Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.card}>
          <Text style={styles.title}>🏆 Safety Stats</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>24</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNum}>180</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNum}>12</Text>
              <Text style={styles.statLabel}>Buddies</Text>
            </View>
          </View>
        </View>

        {/* FEATURES */}
        <View style={styles.card}>
          <Text style={styles.title}>🔒 Protection Features</Text>

          <Text style={styles.info}>✅ Live Location Sharing</Text>
          <Text style={styles.info}>✅ AI Buddy Matching</Text>
          <Text style={styles.info}>✅ Journey Tracking</Text>
          <Text style={styles.info}>✅ SOS Emergency Alert</Text>
        </View>

        {/* TRUST LEVEL */}
        <View style={styles.card}>
          <Text style={styles.title}>🌟 Trust Level</Text>

          <Text style={styles.level}>GOLD MEMBER</Text>
          <Text style={styles.subText}>Trusted Community Traveler</Text>
        </View>

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

  headerGradient: {
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    shadowColor: "#5A3A46",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },

  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },

  avatar: {
    fontSize: 42,
  },

  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 12,
  },

  sub: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
  },

  card: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  titleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 15.5,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  info: {
    color: COLORS.textPrimary,
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 13.5,
  },

  badgeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    padding: 12,
    borderRadius: 16,
  },

  badgeText: {
    marginLeft: 8,
    fontWeight: "700",
    color: COLORS.primary,
    fontSize: 15,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statBox: {
    width: "30%",
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },

  statNum: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  level: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
  },

  subText: {
    textAlign: "center",
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});