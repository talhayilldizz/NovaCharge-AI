import { Text, View } from 'react-native';

export default function IndexScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        VoltPilot AI'a Hoş Geldin!
      </Text>
      <Text style={{ marginTop: 10, color: 'gray' }}>
        Frontend başarıyla temizlendi ve hazır.
      </Text>
    </View>
  );
}
