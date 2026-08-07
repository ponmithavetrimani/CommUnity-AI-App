import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

export default function StartJourneyScreen() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [busNo, setBusNo] = useState('');

  const startJourney = () => {
    console.log(source, destination, busNo);
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Source"
        value={source}
        onChangeText={setSource}
      />

      <TextInput
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
      />

      <TextInput
        placeholder="Bus Number"
        value={busNo}
        onChangeText={setBusNo}
      />

      <Button title="Start Journey" onPress={startJourney} />
    </View>
  );
}