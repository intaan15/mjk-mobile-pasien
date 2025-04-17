import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import TabButton from "../../../components/tabbutton";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const chats = [
  {
    id: 1,
    user: "Zuditanit",
    message: "Selamat pagi dokter",
    date: "17/03/25",
  },
  {
    id: 2,
    user: "Fahri",
    message: "Bagaimana hasil tes kemarin?",
    date: "17/03/25",
  },
  {
    id: 3,
    user: "Aisyah",
    message: "Terima kasih dokter atas bantuannya.",
    date: "17/03/25",
  },
  {
    id: 4,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
  {
    id: 5,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
  {
    id: 6,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
  {
    id: 7,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
  {
    id: 8,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
  {
    id: 9,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
  {
    id: 10,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
  {
    id: 11,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
  {
    id: 12,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
  {
    id: 13,
    user: "Budi",
    message: "Saya merasa lebih baik sekarang.",
    date: "17/03/25",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("Berlangsung");

  return (
    <Background>
      <View className="flex-1">
        {/* <Navbar /> */}

        {/* Header */}
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 pt-8">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl ml-2">Konsultasi</Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>
        <View className="flex flex-row mx-6 rounded-xl border-2 border-skyDark overflow-hidden">
          {["Berlangsung", "Selesai"].map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              isActive={selectedTab === tab}
              onPress={() => setSelectedTab(tab)}
            />
          ))}
        </View>

        {/* Chat List */}
        <View className="flex-1">
          <ScrollView
            className="px-6 py-4"
            contentContainerStyle={{ paddingBottom: 80 }} // Menambah padding bawah agar tidak tertutup navbar
          >
            {chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                className="flex flex-col"
                onPress={() => router.push("/chat/[id]")}
              >
                <View className="flex flex-row items-center">
                  <Image
                    source={images.foto}
                    className="h-16 w-16 rounded-full border border-gray-300"
                    resizeMode="cover"
                  />
                  <View className="ml-4 flex-1">
                    <View className="flex flex-row justify-between">
                      <Text className="font-semibold text-lg">{chat.user}</Text>
                      <Text className="text-gray-500 text-sm">{chat.date}</Text>
                    </View>
                    <Text className="text-gray-700 mt-1">{chat.message}</Text>
                  </View>
                </View>
                <View className="w-full h-[2px] bg-skyDark my-2" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Background>
  );
}
