import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { images } from "../../constants/images";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


export default function Fotoktp() {
  const router = useRouter();

  return (
    <View className="">
      {/* Header */}
      <View className="flex flex-row justify-between items-center w-full px-5 py-5 pt-8">
        <View className="flex flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
          </TouchableOpacity>
          <Text className="text-skyDark font-bold text-xl pl-2">
            Foto KTP
          </Text>
        </View>
        <Image
          className="h-10 w-12"
          source={images.logo}
          resizeMode="contain"
        />
      </View>
      <View className='items-center'>
        <View className=" w-4/5">
          <Text className=" text-skyDark text-[22px] font-extrabold">Ambil Foto KTP</Text>
        </View>
        {/* Kamera dengan frame */}
        <Text className='bg-yellow-300 w-[310px] h-[480px] mt-3'>INI BAGIAN KAMERA</Text>

        <View className='mt-4 w-5/6'>
          <Text className="text-medium text-[15px] text-black  mb-4  w-5/6">
            Tempatkan KTP di dalam area yang tersedia.
          </Text>
        </View> 
        {/* Tombol */}
        <View className="flex flex-row gap-4 mb-3">
          <TouchableOpacity
            className="bg-[#025F96] w-[150px] h-[35px] items-center justify-center rounded-md"
          >
            <Text className="text-white">Ambil Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#025F96] w-[150px] h-[35px] items-center justify-center rounded-md"
          >
            <Text className="text-white">Ambil Ulang</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="bg-[#025F96] w-[314px] h-[35px] items-center justify-center rounded-md"
        >
          <Text className="text-white text-center">Simpan</Text>
        </TouchableOpacity>
      </View>  
    </View>
  );
}

