import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

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
  danger: "#D6295E",
  dangerSoft: "#FDEAF0",
};

export default function OTPPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [otpExpired, setOtpExpired] = useState(false);

  useEffect(() => {
    if (!otpSent) return;

    if (timeLeft <= 0) {
      setOtpExpired(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, otpSent]);

  const handleSendOTP = () => {
    if (phone.length !== 10) {
      Alert.alert("Invalid Number", "Enter valid 10-digit number");
      return;
    }

    setOtpSent(true);
    setTimeLeft(60);
    setOtpExpired(false);
    setOtp("");

    Alert.alert("Success", "OTP sent successfully");
  };

  const handleVerifyOTP = () => {
    if (otpExpired) {
      Alert.alert("OTP Expired", "Resend OTP");
      return;
    }

    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Enter 6-digit OTP");
      return;
    }

    router.replace("/(tabs)/home");
  };

  const handleResendOTP = () => {
    setTimeLeft(60);
    setOtpExpired(false);
    setOtp("");

    Alert.alert("OTP Resent", "New OTP sent");
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
          <Text style={styles.step}>STEP 3 OF 3</Text>
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

          <Text style={styles.heading}>Phone Verification</Text>
          <Text style={styles.sub}>
            Secure OTP verification for safe journey access
          </Text>

          {/* CARD */}
          <View style={styles.card}>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Phone Number"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                editable={!otpSent}
              />
            </View>

            {!otpSent ? (
              <TouchableOpacity activeOpacity={0.85} onPress={handleSendOTP}>
                <LinearGradient
                  colors={[COLORS.heroFrom, COLORS.heroTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Send OTP</Text>
                  <Ionicons name="paper-plane-outline" size={16} color="#fff" style={{ marginLeft: 6 }} />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <>
                {/* TIMER BADGE */}
                <View style={[styles.timerBadge, otpExpired && { backgroundColor: COLORS.dangerSoft }]}>
                  <Ionicons
                    name={otpExpired ? "time-outline" : "hourglass-outline"}
                    size={14}
                    color={otpExpired ? COLORS.danger : COLORS.primary}
                  />
                  <Text style={[styles.timerText, otpExpired && { color: COLORS.danger }]}>
                    {otpExpired ? "OTP Expired" : `Expires in ${timeLeft}s`}
                  </Text>
                </View>

                <View style={styles.inputWrap}>
                  <Ionicons name="keypad-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="Enter OTP"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>

                <TouchableOpacity activeOpacity={0.85} onPress={handleVerifyOTP}>
                  <LinearGradient
                    colors={[COLORS.heroFrom, COLORS.heroTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Verify OTP</Text>
                    <Ionicons name="lock-closed-outline" size={16} color="#fff" style={{ marginLeft: 6 }} />
                  </LinearGradient>
                </TouchableOpacity>

                {otpExpired && (
                  <TouchableOpacity onPress={handleResendOTP} style={styles.resendLink}>
                    <Text style={styles.resend}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
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
    width: "100%",
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
    paddingVertical: 16,
    fontSize: 17,
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: 1,
  },

  otpInput: {
    letterSpacing: 6,
    fontWeight: "700",
  },

  button: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
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

  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 20,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 6,
  },

  timerText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  resendLink: {
    marginTop: 16,
  },

  resend: {
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },
});