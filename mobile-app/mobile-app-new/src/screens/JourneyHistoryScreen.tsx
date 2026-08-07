import React from 'react';
import { View, Text, FlatList } from 'react-native';

const journeys = [
  {
    id: '1',
    source: 'Tambaram',
    destination: 'T Nagar',
  },
  {
    id: '2',
    source: 'Guindy',
    destination: 'Velachery',
  },
];

export default function JourneyHistoryScreen() {
  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={journeys}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>
            {item.source} → {item.destination}
          </Text>
        )}
      />
    </View>
  );
}