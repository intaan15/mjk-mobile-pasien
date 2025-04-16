import { Stack } from "expo-router";

export default function ArtikelLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Artikel" }} />
      <Stack.Screen name="selengkapnya" options={{ title: "Selengkapnya" }} />
    </Stack>
  );
}
