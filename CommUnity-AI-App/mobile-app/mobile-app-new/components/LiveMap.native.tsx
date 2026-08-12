import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
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

// This file only ever gets bundled for iOS/Android (Metro auto-picks
// LiveMap.native.tsx over LiveMap.web.tsx based on platform), so
// react-native-maps is never touched in a web build.
export default function LiveMap({
  sourceCoords,
  destCoords,
  routePath,
  currentLocation,
  buddyLabel,
  primaryColor,
  successColor,
  textSecondary,
}: Props) {
  if (!sourceCoords || !destCoords) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: (sourceCoords.latitude + destCoords.latitude) / 2,
        longitude: (sourceCoords.longitude + destCoords.longitude) / 2,
        latitudeDelta: Math.max(0.02, Math.abs(sourceCoords.latitude - destCoords.latitude) * 1.6),
        longitudeDelta: Math.max(0.02, Math.abs(sourceCoords.longitude - destCoords.longitude) * 1.6),
      }}
    >
      {routePath.length > 1 && (
        <Polyline coordinates={routePath} strokeWidth={4} strokeColor={primaryColor} />
      )}

      <Marker coordinate={sourceCoords} title="Source" pinColor={textSecondary} />
      <Marker coordinate={destCoords} title="Destination" pinColor={successColor} />

      {currentLocation && (
        <Marker coordinate={currentLocation} title={buddyLabel} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.buddyMarker, { backgroundColor: primaryColor }]}>
            <Ionicons name="navigate" size={16} color="#FFF" />
          </View>
        </Marker>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: "100%", height: 210, borderRadius: 14 },
  fallback: {
    height: 150,
    borderRadius: 14,
    backgroundColor: "#F8F5F6",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: { color: "#8A7C86" },
  buddyMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});