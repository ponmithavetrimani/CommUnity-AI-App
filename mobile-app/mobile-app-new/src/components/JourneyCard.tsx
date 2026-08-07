import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface JourneyCardProps {
  source: string;
  destination: string;
  status: string;
}

export default function JourneyCard({
  source,
  destination,
  status,
}: JourneyCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {source} → {destination}
      </Text>

      <Text>Status: {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
});