import React from 'react';
import { View, Button, Alert } from 'react-native';

export default function SOSScreen() {
  const sendSOS = () => {
    Alert.alert('SOS Alert Sent');
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="🚨 SOS" onPress={sendSOS} />
    </View>
  );
}