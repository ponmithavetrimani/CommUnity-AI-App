import React from 'react';
import { View, Text } from 'react-native';

export default function JourneyTrackingScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Journey Tracking</Text>

      <Text>Status: Active</Text>

      <Text>Location Updates Coming...</Text>

      <Text>Risk Level: LOW</Text>
    </View>
  );
}
import {
  getCurrentLocation,
} from "../services/locationService";

import {
  showLocalNotification,
} from "../services/notificationService";

const checkLocation = async () => {
  const location =
    await getCurrentLocation();

  console.log(location);

  if (location) {
    await showLocalNotification(
      "Tracking Active",
      "Location updated successfully."
    );
  }
};