import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');

  return (
    <View style={{ padding: 20 }}>
      <Text>Women's Travel Safety</Text>

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        style={{
          borderWidth: 1,
          marginVertical: 10,
          padding: 10,
        }}
      />

      <Button title="Send OTP" onPress={() => {}} />
    </View>
  );
}