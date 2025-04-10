import { Stack } from "expo-router";

export default function ProfilLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Beranda" }} />
      <Stack.Screen name="keluhan" options={{ title: "Keluhan" }} />
    </Stack>
  );
}
