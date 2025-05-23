import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@env";

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

  useFocusEffect(
    useCallback(() => {
      const fetchDoctors = async () => {
        try {
          const token = await SecureStore.getItemAsync("userToken");
          if (!token) {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userId");
            router.replace("/screens/signin");
          }
          if (!token) return;

          const response = await axios.get(`${BASE_URL}/dokter/getall`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          setDoctors(response.data);
        } catch (error) {
          console.log("Gagal fetch data dokter:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
    }, [])
  );

  const filteredDoctors = spesialis
    ? doctors.filter((doctor) => doctor.spesialis_dokter === spesialis)
    : doctors;

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
        {loading ? (
          <View className="flex h-5/6 justify-center items-center">
            <ActivityIndicator size="large" color="#025F96" />
            <Text className="mt-2 text-skyDark font-semibold">
              Memuat dokter Poli {spesialis} . . .
            </Text>
          </View>
        ) : (
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
                        doctor_Id: doctor._id,
                        doctorName: doctor.nama_dokter,
                      },
                    })
                  }
                >
                  <View className="px-4">
                    {doctor.foto_profil_dokter ? (
                      <Image
                        source={{
                          uri: `https://mjk-backend-production.up.railway.app/uploads/${doctor.foto_profil_dokter}`,
                        }}
                        className="h-16 w-16 rounded-full border border-gray-300"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-16 w-16 rounded-full border border-gray-300 items-center justify-center bg-gray-200">
                        <Ionicons name="person" size={32} color="#0C4A6E" />
                      </View>
                    )}
                  </View>
                  <View className="w-3/4">
                    <Text
                      className="w-11/12 truncate font-bold text-base text-skyDark pb-1"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
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
        )}
      </View>
    </Background>
  );
}
