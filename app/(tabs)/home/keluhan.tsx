import { View, Text, TextInput, Image, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function Keluhan() {
  const router = useRouter();
  const { spesialis, doctorName, selectedTime, selectedDate } = useLocalSearchParams();
  const [keluhanText, setKeluhanText] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [userId, setuserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`https://mjk-backend-production.up.railway.app/api/dokter/getbyname/${doctorName}`);
        setDoctorId(res.data._id);
      } catch (err) {
        Alert.alert("Error", "Gagal mengambil data dokter.");
      }
    };

    fetchDoctor();
  }, [doctorName]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("userId");
        if (storedUserId) {
          setuserId(storedUserId);
        } else {
          console.log("No userId found in SecureStore");
        }
      } catch (err) {
        Alert.alert("Error", "Gagal mengambil data pengguna.");
      }
    };

    fetchUserId();
  }, []);

  const handleSubmit = async () => {

    if (!doctorId || !userId || !selectedTime || !selectedDate || !keluhanText) {
      Alert.alert("Data tidak lengkap", "Pastikan semua data tersedia.");
      return;
    }

    try {
      const date = new Date(selectedDate as string);
      const [hour, minute] = (selectedTime as string).split(":").map(Number);
      const jamSelesaiDate = new Date(date);
      jamSelesaiDate.setHours(hour);
      jamSelesaiDate.setMinutes(minute + 30);

      const payload = {
        dokter_id: doctorId,
        masyarakat_id: userId,
        tgl_konsul: date.toISOString(),
        keluhan_pasien: keluhanText,
        jumlah_konsul: 1,
        status_konsul: "menunggu",
      };

      await axios.post("https://mjk-backend-production.up.railway.app/api/jadwal/create", payload);
      Alert.alert("Sukses", "Jadwal konsultasi berhasil dibuat!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Gagal", error?.response?.data?.message || "Terjadi kesalahan.");
    }
  };

  return (
    <Background>
      <View className="flex-1">
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 py-5 pt-10">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl ml-2">
              {doctorName ? `Keluhan untuk ${doctorName}` : "Keluhan"}
            </Text>
          </View>
          <Image className="h-10 w-12" source={images.logo} resizeMode="contain" />
        </View>

        <View className="items-center">
          <Text className="text-skyDark font-extrabold text-2xl pb-8">
            Silahkan cerita keluhan anda hari ini
          </Text>
          <View className="w-3/4">
            <TextInput
              placeholder="Tulis keluhan anda disini"
              className="bg-transparent border-gray-400 border-2 text-skyDark px-4 py-3 rounded-xl"
              placeholderTextColor="#025F96"
              value={keluhanText}
              onChangeText={setKeluhanText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View className="items-end pt-10">
              <TouchableOpacity
                className="px-8 bg-skyDark rounded-lg text-center"
                onPress={handleSubmit}
              >
                <Text className="p-3 text-slate-100 font-bold text-sm">
                  Kirim
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Background>
  );
}
