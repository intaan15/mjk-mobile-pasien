import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Background from "../../../components/background";
import { images } from "../../../constants/images";

type Doctor = {
  _id: string;
  nama_dokter: string;
  spesialis_dokter: string;
  rating_dokter: number;
  foto_profil_dokter?: string;
};

export default function Index() {
  const router = useRouter();
  const { spesialis } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("https://mjk-backend-production.up.railway.app/api/dokter/getall");
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Gagal fetch data dokter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = spesialis
    ? doctors.filter((doctor) => doctor.spesialis_dokter === spesialis)
    : doctors;

  if (loading) {
    return (
      <Background>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#025F96" />
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <View>
        <View className="flex flex-row justify-between items-center w-full px-5 py-5 pt-10">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl pl-2">
              {spesialis ? `Dokter Poli ${spesialis}` : "Daftar Dokter"}
            </Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>

        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingTop: 20,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-5 pb-6 w-4/5">
            {filteredDoctors.map((doctor, index) => (
              <TouchableOpacity
                key={doctor._id || index}
                className="bg-white w-full h-24 rounded-3xl flex-row items-center justify-center shadow-md"
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/home/pilihjadwal",
                    params: {
                      doctorId: doctor._id,
                      doctorName: doctor.nama_dokter,
                    },
                  })
                }
              >
                <View className="px-4">
                  <Image
                    source={
                      doctor.foto_profil_dokter
                        ? { uri: doctor.foto_profil_dokter }
                        : images.foto
                    }
                    className="h-16 w-16 rounded-full border border-gray-300"
                    resizeMode="cover"
                  />
                </View>
                <View className="w-3/4">
                  <Text className="font-bold text-base text-skyDark pb-1">
                    {doctor.nama_dokter}
                  </Text>
                  <View className="h-[2px] bg-skyDark w-11/12" />
                  <View className="flex-row pt-1 items-center">
                    <FontAwesome name="star" size={20} color="#025F96" />
                    <Text className="font-bold text-base text-skyDark pl-1">
                      {doctor.rating_dokter}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Background>
  );
}
