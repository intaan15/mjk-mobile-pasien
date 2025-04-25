import React from 'react'
import { Camera, CameraType } from 'expo-camera';
import type { CameraCapturedPicture } from 'expo-camera';
import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { images } from "../../constants/images";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


export default function Fotoktp() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>📵 Tidak ada akses kamera</Text>;

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
        {/* <View className="rounded-2xl overflow-hidden w-[309px] h-[479px] relative">
          <Camera
            style={{ flex: 1 }}
            type={CameraType.back}
            ref={cameraRef} 
          /> */}
          {/* Frame hijau putus-putus */}
          {/* <View style={styles.frame} />
        </View> */}

        <View className='mt-4 w-5/6'>
          <Text className="text-medium text-[15px] text-black  mb-4  w-5/6">
            Tempatkan KTP di dalam area yang tersedia.
          </Text>
        </View> 
        {/* Tombol */}
        <View className="flex flex-row gap-4 mb-3">
          <TouchableOpacity
            className="bg-[#025F96] w-[150px] h-[35px] items-center justify-center rounded-md"
            onPress={takePicture}
          >
            <Text className="text-white">Ambil Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#025F96] w-[150px] h-[35px] items-center justify-center rounded-md"
            onPress={() => setPhoto(null)}
          >
            <Text className="text-white">Ambil Ulang</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="bg-[#025F96] w-[314px] h-[35px] items-center justify-center rounded-md"
          onPress={() => {
            // simpan logika simpan di sini
          }}
        >
          <Text className="text-white text-center">Simpan</Text>
        </TouchableOpacity>

        

      </View>  
      
   
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: "absolute",
    top: 190, 
    left: 24, 
    width: 260,
    height: 100,
    borderWidth: 2,
    borderColor: "#00FF00",
    borderStyle: "dashed",
    borderRadius: 8,
  },
});
