import React from 'react';
import { View, Text, Button } from 'react-native';

export default function BuddyMatchScreen() {
  const buddy = {
    name: 'Priya',
    trustScore: 147,
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Travel Buddy Found</Text>

      <Text>Name: {buddy.name}</Text>
      <Text>Trust Score: {buddy.trustScore}</Text>

      <Button title="Accept Buddy" onPress={() => {}} />
    </View>
  );
}