import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";

import {
  AuthProvider,
} from "./src/context/AuthContext";

import {
  JourneyProvider,
} from "./src/context/JourneyContext";

export default function App() {
  return (
    <AuthProvider>
      <JourneyProvider>
        <AppNavigator />
      </JourneyProvider>
    </AuthProvider>
  );
}