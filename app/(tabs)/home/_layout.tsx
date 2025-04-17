import { Stack } from "expo-router";

export default function ProfilLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Beranda" }} />
      <Stack.Screen name="keluhan" options={{ title: "Keluhan" }} />
      <Stack.Screen name="listdokter" options={{ title: "List Dokter" }} />
      <Stack.Screen name="pilihjadwal" options={{ title: "Pilih Jadwal" }} />
    </Stack>
  );
}
