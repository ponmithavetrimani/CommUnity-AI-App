import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

interface BuddyCardProps {
  name: string;
  trustScore: number;
  onAccept: () => void;
}

export default function BuddyCard({
  name,
  trustScore,
  onAccept,
}: BuddyCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>

      <Text>Trust Score: {trustScore}</Text>

      <Button
        title="Connect"
        onPress={onAccept}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 8,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
});