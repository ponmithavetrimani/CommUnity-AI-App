import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome to CommUnity AI</Text>

      <Button
        title="Start Journey"
        onPress={() => navigation.navigate('StartJourney')}
      />

      <Button
        title="Journey History"
        onPress={() => navigation.navigate('JourneyHistory')}
      />

      <Button
        title="Profile"
        onPress={() => navigation.navigate('Profile')}
      />
    </View>
  );
}