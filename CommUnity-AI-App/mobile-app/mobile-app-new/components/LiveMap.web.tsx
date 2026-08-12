import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Coords = { latitude: number; longitude: number };

type Props = {
  sourceCoords: Coords | null;
  destCoords: Coords | null;
  routePath: Coords[];
  currentLocation: Coords | null;
  buddyLabel: string;
  primaryColor: string;
  successColor: string;
  textSecondary: string;
};

// Metro picks this file automatically for web builds instead of
// LiveMap.native.tsx — react-native-maps is never imported here, so the
// "codegenNativeComponent is not a function" crash can't happen on web.
export default function LiveMap(_props: Props) {
  return (
    <View style={styles.fallback}>
      <Ionicons name="map-outline" size={26} color="#8A7C86" />
      <Text style={styles.fallbackText}>
        Live map view is available on the mobile app (iOS/Android)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    height: 150,
    borderRadius: 14,
    backgroundColor: "#F8F5F6",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  fallbackText: {
    color: "#8A7C86",
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});