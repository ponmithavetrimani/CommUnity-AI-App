import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const COLORS = {
  bg: "#F8F5F6",
  surface: "#FFFFFF",
  primary: "#7A1B41",
  primarySoft: "#FBEAF0",
  textPrimary: "#20141C",
  textSecondary: "#8A7C86",
  success: "#12B76A",
  successSoft: "#E7F9EF",
};

type NotificationItem = {
  id: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  title: string;
  detail: string;
  time: string;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    icon: "shield-checkmark-outline",
    iconColor: COLORS.success,
    iconBg: COLORS.successSoft,
    title: "Safety score updated",
    detail: "Your safety score is 98% — Excellent",
    time: "2 mins ago",
  },
  {
    id: "2",
    icon: "people-outline",
    iconColor: COLORS.primary,
    iconBg: COLORS.primarySoft,
    title: "Buddy request",
    detail: "A verified traveller wants to connect on your route",
    time: "1 hour ago",
  },
  {
    id: "3",
    icon: "location-outline",
    iconColor: "#2563EB",
    iconBg: "#E7F1FE",
    title: "Live tracking started",
    detail: "Your journey is now being monitored",
    time: "Yesterday",
  },
];

export default function NotificationsPage() {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.bg} barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {NOTIFICATIONS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={20} color={item.iconColor} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  textWrap: { flex: 1 },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  detail: {
    marginTop: 3,
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  time: {
    marginTop: 6,
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});