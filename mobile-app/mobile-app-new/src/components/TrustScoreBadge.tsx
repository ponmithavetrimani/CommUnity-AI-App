import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TrustScoreBadgeProps {
  score: number;
}

export default function TrustScoreBadge({
  score,
}: TrustScoreBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        ⭐ {score}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
});