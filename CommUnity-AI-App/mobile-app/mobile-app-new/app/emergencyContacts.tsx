import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ================= DESIGN TOKENS =================
// Shared across the app: deep maroon/wine gradient hero, clean white
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
  placeholder: "#B4A3AD",
};

export default function EmergencyContactsPage() {
  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");

  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");

  const [friendName, setFriendName] = useState("");
  const [friendPhone, setFriendPhone] = useState("");

  const [saving, setSaving] = useState(false);

  const saveContacts = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem(
        "emergencyContacts",
        JSON.stringify({
          motherName,
          motherPhone,
          fatherName,
          fatherPhone,
          friendName,
          friendPhone,
        })
      );

      router.push("/otp");
    } catch (error) {
      console.log("Error saving contacts:", error);
    } finally {
      setSaving(false);
    }
  };

  const Input = ({ placeholder, value, onChangeText, keyboardType, icon }: any) => (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={18} color={COLORS.primary} style={styles.inputIcon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* background circles — matches rest of the app */}
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.shieldWrap}>
              <LinearGradient
                colors={[COLORS.heroFrom, COLORS.heroTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shieldCircle}
              >
                <Ionicons name="people-circle" size={38} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.heading}>Emergency Contacts</Text>
            <Text style={styles.subHeading}>
              Add trusted people for instant SOS alerts
            </Text>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>👩</Text>
              <Text style={styles.sectionTitle}>Mother</Text>
            </View>

            <Input
              icon="person-outline"
              placeholder="Mother's Name"
              value={motherName}
              onChangeText={setMotherName}
            />
            <Input
              icon="call-outline"
              placeholder="Mother's Phone"
              value={motherPhone}
              onChangeText={setMotherPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>👨</Text>
              <Text style={styles.sectionTitle}>Father</Text>
            </View>

            <Input
              icon="person-outline"
              placeholder="Father's Name"
              value={fatherName}
              onChangeText={setFatherName}
            />
            <Input
              icon="call-outline"
              placeholder="Father's Phone"
              value={fatherPhone}
              onChangeText={setFatherPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>👭</Text>
              <Text style={styles.sectionTitle}>Best Friend</Text>
            </View>

            <Input
              icon="person-outline"
              placeholder="Friend's Name"
              value={friendName}
              onChangeText={setFriendName}
            />
            <Input
              icon="call-outline"
              placeholder="Friend's Phone"
              value={friendPhone}
              onChangeText={setFriendPhone}
              keyboardType="phone-pad"
            />

            {/* BUTTON */}
            <TouchableOpacity activeOpacity={0.85} onPress={saveContacts} disabled={saving}>
              <LinearGradient
                colors={[COLORS.heroFrom, COLORS.heroTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, saving && { opacity: 0.75 }]}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  bgCircleTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primarySoft,
    top: -70,
    right: -70,
  },

  bgCircleBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primarySoft,
    bottom: -90,
    left: -80,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  shieldWrap: {
    alignItems: "center",
    marginBottom: 14,
  },

  shieldCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  heading: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },

  subHeading: {
    color: COLORS.textSecondary,
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: 22,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
    gap: 8,
  },

  sectionEmoji: {
    fontSize: 18,
  },

  sectionTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 15,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  button: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});