import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import StartJourneyScreen from "../screens/StartJourneyScreen";
import BuddyMatchScreen from "../screens/BuddyMatchScreen";
import JourneyTrackingScreen from "../screens/JourneyTrackingScreen";
import SOSScreen from "../screens/SOSScreen";
import ProfileScreen from "../screens/ProfileScreen";
import JourneyHistoryScreen from "../screens/JourneyHistoryScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="StartJourney"
          component={StartJourneyScreen}
        />

        <Stack.Screen
          name="BuddyMatch"
          component={BuddyMatchScreen}
        />

        <Stack.Screen
          name="Tracking"
          component={JourneyTrackingScreen}
        />

        <Stack.Screen
          name="SOS"
          component={SOSScreen}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />

        <Stack.Screen
          name="JourneyHistory"
          component={JourneyHistoryScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}