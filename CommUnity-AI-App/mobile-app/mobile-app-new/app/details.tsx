import React, { useState, useEffect } from "react";
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
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  avatarBorder: "#F1D9E3",
};

/* INPUT COMPONENT — defined OUTSIDE DetailsPage so it keeps a stable
   reference across re-renders. Defining it inside the component body
   caused a brand-new Input function on every keystroke, so React
   unmounted and remounted the TextInput each time (losing focus after
   every single letter). */
const Input = ({ placeholder, value, onChangeText, keyboardType, icon }: any) => (
  <View style={styles.inputWrapper}>
    <Ionicons name={icon} size={18} color={COLORS.primary} style={styles.inputIcon} />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={COLORS.placeholder}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

export default function DetailsPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem("userProfile");
        if (savedProfile) {
          const p = JSON.parse(savedProfile);
          setName(p.name || "");
          setAge(p.age || "");
          setEmail(p.email || "");
          setPhone(p.phone || "");
          setCity(p.city || "");
          setCountry(p.country || "");
          setLanguage(p.language || "");
          setEmergencyContact(p.emergencyContact || "");
        }
      } catch (e) {
        console.log(e);
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem(
        "userProfile",
        JSON.stringify({
          name,
          age,
          email,
          phone,
          city,
          country,
          language,
          emergencyContact,
        })
      );

      router.push("/otp");
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

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
          {/* STEP INDICATOR */}
          <Text style={styles.step}>STEP 2 OF 3</Text>
          <View style={styles.progress}>
            <View style={styles.fill} />
          </View>

          <Text style={styles.heading}>Create Profile</Text>
          <Text style={styles.sub}>AI builds your safety identity</Text>

          {/* AVATAR */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👩</Text>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            <Input icon="person-outline" placeholder="Full Name" value={name} onChangeText={setName} />
            <Input icon="calendar-outline" placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
            <Input icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Input icon="call-outline" placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Input icon="location-outline" placeholder="City" value={city} onChangeText={setCity} />
            <Input icon="flag-outline" placeholder="Country" value={country} onChangeText={setCountry} />
            <Input icon="globe-outline" placeholder="Language" value={language} onChangeText={setLanguage} />
            <Input
              icon="alert-circle-outline"
              placeholder="Emergency Contact"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              keyboardType="phone-pad"
            />

            {/* BUTTON */}
            <TouchableOpacity activeOpacity={0.85} onPress={saveProfile} disabled={saving}>
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

          <View style={{ height: 60 }} />
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

  step: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },

  progress: {
    height: 8,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 10,
    marginBottom: 25,
    overflow: "hidden",
  },

  fill: {
    width: "66%",
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },

  heading: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: "900",
  },

  sub: {
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 10,
    fontSize: 14,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.avatarBorder,
  },

  avatarText: {
    fontSize: 50,
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