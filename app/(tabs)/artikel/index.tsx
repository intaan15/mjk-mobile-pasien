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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import TabButton from "../../../components/tabbutton";
import { images } from "../../../constants/images";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const artikelList = [
  {
    id: 1,
    nama_artikel: "Penyebab Serangan Jantung",
    tgl_terbit_artikel: "12 Juni 2025",
    gambar_artikel: images.artikel,
    kategori_artikel: "Kesehatan",
    isi_artikel:
      "Serangan jantung disebabkan oleh tersumbatnya aliran darah ke jantung, biasanya akibat plak kolesterol.",
  },
  {
    id: 2,
    nama_artikel: "Efek samping paracetamol",
    tgl_terbit_artikel: "30 Januari 1988",
    gambar_artikel: images.artikelobat,
    kategori_artikel: "Obat",
    isi_artikel:
      "Efek samping paracetamol bisa meliputi mual, ruam kulit, dan dalam kasus jarang, gangguan hati.",
  },
];
export default function index() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("Kesehatan");
  const insets = useSafeAreaInsets();

  return (
    <Background>
      <View className="flex">
        {/* Header */}
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 pt-8">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.replace("./homescreen")}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl ml-2">Artikel</Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>

        {/* Menu Tab */}
        <View className="flex flex-row mx-6 rounded-xl border-2 border-skyDark overflow-hidden">
          {["Kesehatan", "Obat"].map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              isActive={selectedTab === tab}
              onPress={() => setSelectedTab(tab)}
            />
          ))}
        </View>

        {/* Artikel List */}
        <View className="flex items-center">
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: insets.bottom + 300,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center w-11/12 gap-5">
              {artikelList
                .filter((item) => item.kategori_artikel === selectedTab)
                .map((item) => (
                  <View
                    key={item.id}
                    className="bg-white rounded-2xl w-full h-40 shadow-md"
                  >
                    <Image
                      className="rounded-2xl w-full h-24 p-1"
                      source={item.gambar_artikel}
                      resizeMode="cover"
                    />
                    <View className="flex-row justify-between w-full">
                      <View className="p-3">
                        <Text className="font-bold text-base text-skyDark">
                          {item.nama_artikel}
                        </Text>
                        <Text className="font-medium text-sm text-skyDark">
                          {item.tgl_terbit_artikel}
                        </Text>
                      </View>
                      <View className="w-1/3 items-center justify-center">
                        <TouchableOpacity 
                          className="bg-skyDark items-center justify-center py-2 px-4 rounded-md"
                          onPress={() =>
                            router.push({
                              pathname: "/(tabs)/artikel/selengkapnya",
                              params: { 
                                id: item.id,
                                nama_artikel: item.nama_artikel,
                                gambar_artikel: item.gambar_artikel,
                                tgl_terbit_artikel: item.tgl_terbit_artikel,
                                isi_artikel: item.isi_artikel,
                              },
                            })
                          }>
                          <Text className="font-medium text-sm text-white">
                            Selengkapnya
                          </Text>
                        </TouchableOpacity>

                      </View>
                    </View>
                  </View>
                ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Background>
  );
}
