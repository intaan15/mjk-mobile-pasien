import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React from 'react';
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CancelIcon from "../../../assets/icons/cancel.svg";
import AccIcon from "../../../assets/icons/ctg.svg";
import WaitIcon from "../../../assets/icons/wait.svg";


const dummyDoctors = [
  {
    id: 1,
    name: "Dr. Ikrom Nur Dzawin",
    rating: 4.3,
    photo: images.foto,
    status: "waiting",
    date: "2025-12-23",
    time: "07.15",
  },
  {
    id: 2,
    name: "Dr. Siti Hidayah",
    rating: 4.6,
    photo: images.foto,
    status: "accepted",
    date: "2025-5-25",
    time: "10.00",
  },
  {
    id: 3,
    name: "Dr. Ahmad Basri",
    rating: 4.1,
    photo: images.foto,
    status: "cancelled",
    date: "2025-12-28",
    time: "13.45",
  },
  {
    id: 1,
    name: "Dr. Ikrom Nur Dzawin",
    rating: 4.3,
    photo: images.foto,
    status: "waiting",
    date: "2025-7-23",
    time: "07.15",
  },
  {
    id: 2,
    name: "Dr. Siti Hidayah",
    rating: 4.6,
    photo: images.foto,
    status: "accepted",
    date: "2025-5-25",
    time: "10.00",
  },
  {
    id: 3,
    name: "Dr. Ahmad Basri",
    rating: 4.1,
    photo: images.foto,
    status: "cancelled",
    date: "2025-1-28",
    time: "13.45",
  },
  {
    id: 1,
    name: "Dr. Ikrom Nur Dzawin",
    rating: 4.3,
    photo: images.foto,
    status: "waiting",
    date: "2025-12-13",
    time: "07.15",
  },
  {
    id: 2,
    name: "Dr. Siti Hidayah",
    rating: 4.6,
    photo: images.foto,
    status: "accepted",
    date: "2025-3-25",
    time: "10.00",
  },
  {
    id: 3,
    name: "Dr. Ahmad Basri",
    rating: 4.1,
    photo: images.foto,
    status: "cancelled",
    date: "2025-2-28",
    time: "13.45",
  },
];


const getDayName = (dateString) => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const date = new Date(dateString);
  return days[date.getDay()];
};


export default function index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Background>
      <View className="">
        <View className="flex flex-row justify-between items-center w-full px-5 py-5 pt-8">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl pl-2">
              Jadwal
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
              <View
                key={index}
                className="bg-white w-full h-40 rounded-3xl flex-col justify-center shadow-md"
              >
                <View className="flex-row">
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
                </View>
                <View className="flex-row justify-between px-4">
                  <View className="flex-col pt-1">
                    <Text className="font-bold text-sm text-skyDark">
                      {getDayName(doctor.date)},
                    </Text>
                    <Text className="font-bold text-sm text-skyDark">
                      {new Date(doctor.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                    <Text className="font-bold text-sm text-skyDark">Pukul {doctor.time}</Text>
                  </View>
                  <View className="justify-center w-1/3 flex-col">
                    <View
                      className={`p-2 flex-row gap-2 rounded-xl items-center justify-between ${
                        doctor.status === "accepted"
                          ? "bg-green-600"
                          : doctor.status === "cancelled"
                          ? "bg-red-600"
                          : "bg-skyDark"
                      }`}
                    >
                      {doctor.status === "waiting" && <WaitIcon width={18} height={18} />}
                      {doctor.status === "accepted" && <AccIcon width={18} height={18} />}
                      {doctor.status === "cancelled" && <CancelIcon width={18} height={18} />}
                      <View className="w-3/4 justify-center items-center">
                        <Text className="text-white font-bold text-sm">
                          {doctor.status === "waiting" && "Menunggu"}
                          {doctor.status === "accepted" && "Diterima"}
                          {doctor.status === "cancelled" && "Ditolak"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Background>
)}