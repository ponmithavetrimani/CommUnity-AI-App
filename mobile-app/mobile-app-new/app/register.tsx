import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

// ================= DESIGN TOKENS =================
// Shared with HomePage/ChatPage/WelcomePage: deep maroon/wine gradient hero,
// clean white surfaces, soft pink accents.
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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    if (!name || !password || !age || !emergencyContact) {
      Alert.alert("Missing details", "Please fill all fields");
      return;
    }

    setRegistering(true);
    try {
      await api.post("/users/register", {
        name,
        password,
        age,
        emergencyContact,
      });

      Alert.alert("Registration Successful");
      router.replace("/login");
    } catch (error) {
      console.log(error);
      Alert.alert("Registration Failed", "Please check your details and try again.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* background circles — matches Login / Settings / SOS pages */}
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
          <View style={styles.shieldWrap}>
            <LinearGradient
              colors={[COLORS.heroFrom, COLORS.heroTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shieldCircle}
            >
              <Ionicons name="shield-checkmark" size={40} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subHeading}>Join the Safe Travel Network</Text>

          {/* FORM CARD */}
          <View style={styles.card}>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor={COLORS.placeholder}
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={COLORS.placeholder}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                placeholder="Age"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="numeric"
                style={styles.input}
                value={age}
                onChangeText={setAge}
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                placeholder="Emergency Contact"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="phone-pad"
                style={styles.input}
                value={emergencyContact}
                onChangeText={setEmergencyContact}
              />
            </View>

            {/* BUTTON */}
            <TouchableOpacity activeOpacity={0.85} onPress={handleRegister} disabled={registering}>
              <LinearGradient
                colors={[COLORS.heroFrom, COLORS.heroTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, registering && { opacity: 0.75 }]}
              >
                {registering ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Register</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* LOGIN LINK */}
            <TouchableOpacity onPress={() => router.push("/login")} style={styles.loginLink}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginTextBold}>Login</Text>
              </Text>
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

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 60,
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

  shieldWrap: {
    alignItems: "center",
    marginBottom: 14,
  },

  shieldCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
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
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },

  subHeading: {
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 25,
    fontSize: 14,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: 25,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 15,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  button: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
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

  loginLink: {
    marginTop: 20,
  },

  loginText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    fontSize: 14,
  },

  loginTextBold: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});