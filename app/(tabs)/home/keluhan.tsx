import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Background from "../../../components/background";
import { images } from "../../../constants/images";

export default function Keluhan() {
  const router = useRouter();
  const { spesialis } = useLocalSearchParams();
  const [keluhanText, setKeluhanText] = useState("");

  return (
    <Background>
      <View className="flex-1">
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 py-5 pt-10">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl ml-2">
              {spesialis ? `Kuisioner untuk Poli ${spesialis}` : "Kuisioner"}
            </Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
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
                // onPress={() =>
                //   router.push({
                //     pathname: "/(tabs)/home/listdokter",
                //     params: { spesialis, keluhan: keluhanText },
                //   })
                // }
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
