import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// TODO: replace with your own OAuth Client IDs from Google Cloud Console
// (console.cloud.google.com -> APIs & Services -> Credentials).
// You need a separate client ID per platform you ship on.
const GOOGLE_CLIENT_IDS = {
  expoClientId: "YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com",
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
  androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
};

// ================= DESIGN TOKENS =================
// Shared with HomePage/ChatPage/WelcomePage/RegisterScreen/OTPPage: deep
// maroon/wine gradient hero, clean white surfaces, soft pink accents.
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
  border: "#EDE1E6",
};

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_CLIENT_IDS);

  useEffect(() => {
    checkLogin();
  }, []);

  // Fires once Google redirects back with a result
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSuccess(response.authentication?.accessToken);
    } else if (response?.type === "error") {
      setGoogleLoading(false);
      Alert.alert("Google Sign-In failed", "Please try again.");
    }
  }, [response]);

  const handleGoogleSuccess = async (accessToken?: string) => {
    if (!accessToken) {
      setGoogleLoading(false);
      return;
    }
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await res.json(); // { name, email, picture, ... }

      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ name: profile.name, email: profile.email, provider: "google" })
      );
      router.replace("/details");
    } catch (error) {
      console.log("Google profile fetch failed:", error);
      Alert.alert("Google Sign-In failed", "Couldn't fetch your profile. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!request) {
      Alert.alert(
        "Google Sign-In not set up yet",
        "Add your Google OAuth Client IDs at the top of login.tsx to enable this."
      );
      return;
    }
    setGoogleLoading(true);
    await promptAsync();
  };

  const checkLogin = async () => {
    try {
      const user = await AsyncStorage.getItem("user");

      if (user && user !== "null") {
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogin = async () => {
    if (!name || !password) {
      Alert.alert("Missing details", "Please fill all fields");
      return;
    }

    setLoggingIn(true);
    try {
      await AsyncStorage.setItem("user", JSON.stringify({ name, password }));
      router.replace("/details");
    } catch (error) {
      console.log(error);
      Alert.alert("Login failed", "Something went wrong. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* background circles — matches Settings / SOS pages */}
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP INDICATOR */}
          <Text style={styles.step}>STEP 1 OF 3</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

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

          <Text style={styles.heading}>Welcome Back 👋</Text>
          <Text style={styles.sub}>Login to continue your safe journey</Text>

          {/* CARD */}
          <View style={styles.card}>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                placeholder="Name"
                placeholderTextColor={COLORS.placeholder}
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={COLORS.placeholder}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={loggingIn}
            >
              <LinearGradient
                colors={[COLORS.heroFrom, COLORS.heroTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, loggingIn && { opacity: 0.75 }]}
              >
                {loggingIn ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Login</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/register")} style={styles.registerLink}>
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerTextBold}>Register</Text>
              </Text>
            </TouchableOpacity>

            {/* DIVIDER */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* GOOGLE SIGN-IN */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              style={[styles.googleButton, googleLoading && { opacity: 0.7 }]}
            >
              {googleLoading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <>
                  <View style={styles.googleIconWrap}>
                    <Ionicons name="logo-google" size={18} color="#EA4335" />
                  </View>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
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

  content: {
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

  step: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },

  progressBar: {
    height: 8,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 10,
    marginBottom: 24,
    overflow: "hidden",
  },

  progressFill: {
    width: "33%",
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
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

  sub: {
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 25,
    fontSize: 14,
    textAlign: "center",
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

  registerLink: {
    marginTop: 20,
  },

  registerText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    fontSize: 14,
  },

  registerTextBold: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  dividerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginHorizontal: 12,
  },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 15,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  googleIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  googleButtonText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
});