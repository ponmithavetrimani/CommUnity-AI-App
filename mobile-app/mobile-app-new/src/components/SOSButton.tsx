import React from "react";
import {
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
} from "react-native";

export default function SOSButton() {
  const handleSOS = () => {
    Alert.alert(
      "Emergency SOS",
      "Alert sent to trusted contacts."
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleSOS}
    >
      <Text style={styles.text}>
        🚨 SOS
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#D32F2F",
    padding: 20,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
});