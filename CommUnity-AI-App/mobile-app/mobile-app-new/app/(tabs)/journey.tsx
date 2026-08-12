import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// ================= DESIGN TOKENS =================
// Same maroon/wine system as HomePage — deep gradient hero, white form card,
// wine accent for icons, labels, progress bar and CTA.
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
};

export default function JourneyPage() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [transport, setTransport] = useState("");
  const [startTime, setStartTime] = useState("");
  const [period, setPeriod] = useState("AM");

  const handleStartJourney = () => {
    router.push({
      pathname: "/(tabs)/buddy",
      params: {
        source,
        destination,
        busNumber,
        transport,
        startTime: `${startTime} ${period}`,
      },
    });
  };

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
          style={styles.header}
        >
          <View style={styles.headerIconWrap}>
            <Ionicons name="navigate-outline" size={22} color="#FFF" />
          </View>
          <Text style={styles.heading}>Start Journey</Text>
          <Text style={styles.subHeading}>Fill your travel details safely</Text>
        </LinearGradient>

        {/* PROGRESS */}
        <Text style={styles.stepText}>Step 1 of 4</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {/* Source */}
          <View style={styles.field}>
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <Text style={styles.label}>Source</Text>
          </View>
          <TextInput
            placeholder="Enter source"
            placeholderTextColor={COLORS.textSecondary}
            value={source}
            onChangeText={setSource}
            style={styles.input}
          />

          {/* Destination */}
          <View style={styles.field}>
            <Ionicons name="flag" size={18} color={COLORS.primary} />
            <Text style={styles.label}>Destination</Text>
          </View>
          <TextInput
            placeholder="Enter destination"
            placeholderTextColor={COLORS.textSecondary}
            value={destination}
            onChangeText={setDestination}
            style={styles.input}
          />

          {/* Transport */}
          <View style={styles.field}>
            <MaterialCommunityIcons name="bus" size={18} color={COLORS.primary} />
            <Text style={styles.label}>Transport No</Text>
          </View>
          <TextInput
            placeholder="Enter number"
            placeholderTextColor={COLORS.textSecondary}
            value={busNumber}
            onChangeText={setBusNumber}
            style={styles.input}
          />

          {/* Type */}
          <View style={styles.field}>
            <MaterialCommunityIcons name="train" size={18} color={COLORS.primary} />
            <Text style={styles.label}>Transport Type</Text>
          </View>
          <TextInput
            placeholder="Enter type"
            placeholderTextColor={COLORS.textSecondary}
            value={transport}
            onChangeText={setTransport}
            style={styles.input}
          />

          {/* TIME */}
          <View style={styles.field}>
            <Ionicons name="time" size={18} color={COLORS.primary} />
            <Text style={styles.label}>Start Time</Text>
          </View>

          <View style={styles.timeRow}>
            <TextInput
              placeholder="08:30"
              placeholderTextColor={COLORS.textSecondary}
              value={startTime}
              onChangeText={setStartTime}
              style={styles.timeInput}
            />

            <View style={styles.periodBox}>
              <Picker
                selectedValue={period}
                onValueChange={setPeriod}
                style={styles.picker}
              >
                <Picker.Item label="AM" value="AM" />
                <Picker.Item label="PM" value="PM" />
              </Picker>
            </View>
          </View>

          {/* BUTTON */}
          <TouchableOpacity onPress={handleStartJourney}>
            <LinearGradient
              colors={[COLORS.heroFrom, COLORS.heroTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Start Journey 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    marginTop: 55,
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

  stepText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: 8,
  },

  progressBar: {
    height: 6,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 10,
    marginBottom: 22,
    overflow: "hidden",
  },

  progressFill: {
    width: "25%",
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 22,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },

  field: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginTop: 14,
  },

  label: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginLeft: 8,
  },

  input: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14.5,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  timeInput: {
    flex: 1,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14.5,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  periodBox: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 100,
    height: 55,
    justifyContent: "center",
    overflow: "hidden",
  },

  picker: {
    width: 100,
    height: 50,
    color: COLORS.textPrimary,
  },

  button: {
    marginTop: 26,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#5A3A46",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});