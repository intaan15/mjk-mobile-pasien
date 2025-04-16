import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Background from "../../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { images } from "../../../constants/images";

const artikelList = [
  {
    id: 1,
    nama_artikel: "Penyebab Serangan Jantung",
    tgl_terbit_artikel: "12 Juni 2025",
    gambar_artikel: images.artikel,
    kategori_artikel: "Kesehatan",
    isi_artikel:
      "Serangan jantung disebabkan oleh tersumbatnya aliran darah ke jantung, biasanya akibat plak kolesterol. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
  },
  {
    id: 2,
    nama_artikel: "Efek samping paracetamol",
    tgl_terbit_artikel: "30 Januari 1988",
    gambar_artikel: images.artikelobat,
    kategori_artikel: "Obat",
    isi_artikel:
      "Efek samping paracetamol bisa meliputi mual, ruam kulit, dan dalam kasus jarang, gangguan hati. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
  },
];

export default function Selengkapnya() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const artikel = artikelList.find((item) => item.id === Number(id));

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
            <TouchableOpacity onPress={() => router.replace("./homescreen")}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl ml-2">
              {artikel.nama_artikel}
            </Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white rounded-2xl shadow-md mt-4">
            <View className="p-3">
                <Image
                className="w-full h-48 rounded-xl mb-4"
                source={artikel.gambar_artikel}
                resizeMode="cover"
                />
                <Text className="text-skyDark text-right text-sm font-medium pb-1">
                {artikel.tgl_terbit_artikel}
                </Text>
                <Text className="text-skyDark text-center font-bold text-xl pb-4">
                {artikel.nama_artikel}
                </Text>
                <Text className="text-black text-base text-justify leading-relaxed">
                {artikel.isi_artikel}
                </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Background>
  );
}
