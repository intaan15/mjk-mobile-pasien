import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dummyDoctors = [
  {
    id: 1,
    name: "Dr. Ikrom Nur Dzawin",
    rating: 4.3,
    photo: images.foto,
  },
  {
    id: 2,
    name: "Dr. Siti Hidayah",
    rating: 4.6,
    photo: images.foto,
  },
  {
    id: 3,
    name: "Dr. Ahmad Basri",
    rating: 4.1,
    photo: images.foto,
  },
  {
    id: 1,
    name: "Dr. Ikrom Nur Dzawin",
    rating: 4.3,
    photo: images.foto,
  },
  {
    id: 2,
    name: "Dr. Siti Hidayah",
    rating: 4.6,
    photo: images.foto,
  },
  {
    id: 3,
    name: "Dr. Ahmad Basri",
    rating: 4.1,
    photo: images.foto,
  },
  {
    id: 4,
    name: "Dr. Ikrom Nur Dzawin",
    rating: 4.3,
    photo: images.foto,
  },
  {
    id: 5,
    name: "Dr. Siti Hidayah",
    rating: 4.6,
    photo: images.foto,
  },
  {
    id: 6,
    name: "Dr. Ahmad Basri",
    rating: 4.1,
    photo: images.foto,
  },
  {
    id: 7,
    name: "Dr. Ikrom Nur Dzawin",
    rating: 4.3,
    photo: images.foto,
  },
  {
    id: 8,
    name: "Dr. Siti Hidayah",
    rating: 4.6,
    photo: images.foto,
  },
  {
    id: 9,
    name: "Dr. Ahmad Basri",
    rating: 4.1,
    photo: images.foto,
  },
];

export default function index() {
  const router = useRouter();
  const { spesialis } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  return (
    <Background>
      <View className="">
        <View className="flex flex-row justify-between items-center w-full px-5 py-5 pt-10">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl pl-2">
              {spesialis ? `Dokter Poli ${spesialis}` : " "}
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
            {dummyDoctors.map((doctor, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white w-full h-24 rounded-3xl flex-row items-center justify-center shadow-md"
              >
                <View className="px-4">
                  <Image
                    source={doctor.photo}
                    className="h-16 w-16 rounded-full border border-gray-300"
                    resizeMode="cover"
                  />
                </View>
                <View className="w-3/4">
                  <Text className="font-bold text-base text-skyDark pb-1">
                    {doctor.name}
                  </Text>
                  <View className="h-[2px] bg-skyDark w-11/12" />
                  <View className="flex-row pt-1 items-center">
                    <FontAwesome name="star" size={20} color="#025F96" />
                    <Text className="font-bold text-base text-skyDark pl-1">
                      {doctor.rating}
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
