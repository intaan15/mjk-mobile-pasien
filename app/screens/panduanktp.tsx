import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
// import React from 'react'
import { useRouter } from "expo-router";
import Background from "../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { images } from "../../constants/images";
import { FontAwesome } from '@expo/vector-icons';
import ImagePickerComponent, {
  useImage,
  ImageProvider,
} from "../../components/picker/imagepicker";
import React, { useState } from 'react';
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";


const panduan = [
  "Siapkan KTP asli, bukan fotokopian.",
  "Posisikan HP secara tegak saat mengambil foto.",
  "Pastikan foto tidak buram atau terpotong.",
  "Foto tidak boleh berbayang atau memantulkan cahaya.",
];

export default function Panduanktp() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState("info");
  
    const openModal = (type: string) => {
      setModalType(type);
      setModalVisible(true);
    };
  
    const toggleModal = () => {
      setModalVisible(!isModalVisible);
    };
    const imageContext = useImage();
    const setImage = imageContext?.setImage;

  const { openGallery, openCamera } = ImagePickerComponent({
      onImageSelected: setImage,
    });
  
    // Handler baru yang gabung pick image + tutup modal
    

    const handlePickImage = async () => {
      console.log("handlePickImage dipanggil");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Hasil result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log("URI ditemukan:", uri);
        await SecureStore.setItemAsync("fotoKTP", uri);
        router.push("/screens/signup"); // atau "./signup" tergantung struktur router kamu
      } else {
        console.log("Gagal ambil gambar atau user batalin");
      }
    };

    const handleOpenCamera = async () => {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Hasil result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log("URI ditemukan:", uri);
        await SecureStore.setItemAsync("fotoKTP", uri);
        router.push("/screens/signup"); // atau "./signup" tergantung struktur router kamu
      } else {
        console.log("Gagal ambil gambar atau user batalin");
      }
    };

  return (
    <Background>
      <View className="">
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
        <View className="items-center">
          <View className=" w-4/5">
            <Text className=" text-skyDark text-[22px] font-extrabold">Panduan Foto KTP</Text>
            <Text className="text-[15px] mt-5 font-medium">
            Pastikan foto yang kamu ambil nanti sesuai dengan panduan dibawah ini.
            </Text>
          </View>
          <View className="flex flex-row gap-4 mt-4 ">
            <View className="bg-[#00FF4033] w-[160px] h-[316px] rounded-[15px] px-3">
              <View className="flex flex-row gap-3 py-4">
                <FontAwesome name="check-circle" size={24} color="#00A629" />
                <Text className="text-[#00A629] font-bold text-[20px]">Benar</Text>
              </View>
              <Image
              className="h-[251px] w-[140px]"
              source={images.benarktp}
              resizeMode="contain"
              />
            </View>
            <View className="bg-[#FF003033] w-[160px] h-[316px] rounded-[15px] px-3">
              <View className="flex flex-row gap-3 py-4">
                <FontAwesome name="times-circle" size={24} color="#A60000" />
                <Text className="text-[#A60000] font-bold text-[20px] ">Salah</Text>
              </View>
              <Image
              className="h-[260px] w-[140px]"
              source={images.salahktp}
              resizeMode="contain"
              />
            </View>
          </View>
        </View>
        <View className="mt-7 items-center">
          {panduan.map((item, index) => (
            <View key={index} className="flex flex-row items-start mb-1 w-5/6">
              <Text className="text-lg text-black mr-2">•</Text>
              <Text className="text-base font-medium text-black flex-1">{item}</Text>
            </View>
          ))}
        </View>
        <View className="mt-4 items-center gap-3">
          <TouchableOpacity
            onPress={handlePickImage} 
            className="bg-[#025F96] w-[300px] h-[35px] px-6 py-3 rounded-lg"
          >
            <Text className="text-white text-base font-semibold text-center text-[16px]">Ambil Foto Galery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleOpenCamera} 
            className="bg-[#025F96] w-[300px] h-[35px] px-6 py-3 rounded-lg"
          >
            <Text className="text-white text-base font-semibold text-center text-[16px]">Ambil Foto Kamera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  )
}