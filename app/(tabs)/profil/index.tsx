import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { images } from '../../../constants/images';
import Background from "../../../components/background";

// Definisikan interface User
interface User {
  nama_masyarakat: string;
  username_masyarakat: string;
  email_masyarakat: string;
  nik_masyarakat: string;
  alamat_masyarakat: string;
  notlp_masyarakat: string;
  jeniskelamin_masyarakat: string;
  tgl_lahir_masyarakat: string;
  foto_ktp_masyarakat: string;
  selfie_ktp_masyarakat: string;
  foto_profil_masyarakat: string | null;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<User | null>(null);
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const response = await axios.get(`http://10.0.2.2:3333/masyarakat/getbyid/${userId}`);
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data profil:", error);
    }
  };

  if (!userData) {
    return (
      <Background>
        <View className="flex-1 justify-center items-center">
          <Text>Memuat profil...</Text>
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <View className="flex-1">
        <ScrollView>
          {/* Header Profil */}
          <View className="relative pt-12 bg-skyLight rounded-b-[50px] py-28">
            <View className="absolute inset-0 flex items-center justify-between flex-row px-12">
              <Text className="text-skyDark text-2xl font-bold">
                Selamat datang, {"\n"}
                {userData.nama_masyarakat}
              </Text>
              <Image
                className="h-10 w-12"
                source={images.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Foto Profil */}
          <View className="absolute top-28 left-1/2 -translate-x-1/2">
            {userData.foto_profil_masyarakat ? (
              <Image
                source={{ uri: userData.foto_profil_masyarakat }}
                className="w-32 h-32 rounded-full border-4 border-skyDark"
              />
            ) : (
              <View className="rounded-full border-4 border-skyDark items-center justify-center">
                <Text className="text-gray-500">No Image</Text>
              </View>
            )}
          </View>

          {/* Card Profil */}
          <View
            className="bg-white rounded-xl mx-10 mt-24 p-6"
            style={{
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 11,
              elevation: 15,
            }}
          >
            <Text className="font-bold text-lg text-skyDark">Nama</Text>
            <Text className="text-gray-700">{userData.nama_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">Username</Text>
            <Text className="text-gray-700">{userData.username_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">Email</Text>
            <Text className="text-gray-700">{userData.email_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">NIK</Text>
            <Text className="text-gray-700">{userData.nik_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">Alamat</Text>
            <Text className="text-gray-700">{userData.alamat_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">Nomor Telepon</Text>
            <Text className="text-gray-700">{userData.notlp_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">Jenis Kelamin</Text>
            <Text className="text-gray-700">{userData.jeniskelamin_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">Tanggal Lahir</Text>
            <Text className="text-gray-700">{userData.tgl_lahir_masyarakat}</Text>
          </View>
        </ScrollView>
      </View>
    </Background>
  );
}
