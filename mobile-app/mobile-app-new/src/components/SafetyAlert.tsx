import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SafetyAlertProps {
  level: "LOW" | "MEDIUM" | "HIGH";
  message: string;
}

export default function SafetyAlert({
  level,
  message,
}: SafetyAlertProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.level}>
        Risk Level: {level}
      </Text>

      <Text>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF3CD",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  level: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});