import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Background from "../../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { images } from "../../../constants/images";

export default function Selengkapnya() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [artikel, setArtikel] = useState<any>(null);

  useEffect(() => {
    const fetchArtikelDetail = async () => {
      try {
        const response = await fetch(`https://mjk-backend-production.up.railway.app/api/artikel/${id}`);
        const data = await response.json();
        setArtikel(data);
      } catch (error) {
        console.error("Error fetching artikel detail:", error);
      }
    };

    fetchArtikelDetail();
  }, [id]);

  if (!artikel) {
    return (
      <Background>
        <View className="flex-1 justify-center items-center">
          <Text className="text-skyDark font-bold text-xl">
            Artikel tidak ditemukan.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-skyDark px-4 py-2 rounded-md"
          >
            <Text className="text-white">Kembali</Text>
          </TouchableOpacity>
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <View className="flex">
        {/* Header */}
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 pt-8">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl ml-2">
              {artikel.nama_artikel}
            </Text>
          </View>
          <Image className="h-10 w-12" source={images.logo} resizeMode="contain" />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-2xl shadow-md mt-4">
            <View className="p-3">
              <Image
                className="w-full h-48 rounded-xl mb-4"
                source={{ uri: artikel.gambar_artikel }}
                resizeMode="cover"
              />
              <Text className="text-skyDark text-right text-sm font-medium pb-1">
                {new Date(artikel.tgl_terbit_artikel).toLocaleDateString()}
              </Text>
              <Text className="text-skyDark text-center font-bold text-xl pb-4">
                {artikel.nama_artikel}
              </Text>
              <Text className="text-black text-base text-justify leading-relaxed">
                {artikel.detail_artikel}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Background>
  );
}
