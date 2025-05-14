import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { images } from "../../../constants/images";
import Background from "../../../components/background";
import Settings from "../../../components/settings";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ModalContent from "../../../components/modals/ModalContent";
import ModalTemplate from "../../../components/modals/ModalTemplate";
import { useRouter } from "expo-router";



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
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [modalType, setModalType] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await SecureStore.getItemAsync("userId");
      const cleanedUserId = userId?.replace(/"/g, "");
      if (cleanedUserId) {
        const response = await axios.get(
          `https://mjk-backend-production.up.railway.app/api/masyarakat/getbyid/${cleanedUserId}`
        );
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
          <Text className="text-skyDark text-xl font-bold">
            Memuat profil...
          </Text>
        </View>
      </Background>
    );
  }

  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleGantiPassword = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");

      if (!token) {
        setModalType("kolompwkosong");
        setModalVisible(true);
        return;
      }

      const res = await axios.patch(
        "https://mjk-backend-production.up.railway.app/api/masyarakat/ubah-password",
        {
          password_lama: passwordLama,
          password_baru: passwordBaru,
          konfirmasi_password_baru: konfirmasiPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setModalType("ubahberhasil");
      setModalVisible(true);
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Terjadi kesalahan saat mengubah password";

      if (msg.includes("Password lama salah")) {
        setModalType("pwlamasalah");
      } else if (msg.includes("Konfirmasi password tidak cocok")) {
        setModalType("pwtidakcocok");
      } else if (msg.includes("Semua field harus diisi")) {
        setModalType("kolompwkosong");
      } else {
        setModalType("kolompwkosong");
      }
      setModalVisible(true);
    }
  };

  const openModal = (type: string) => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <Background>
      <View className="flex-1">
        <ScrollView>
          {/* Header Profil */}
          <View className="relative pt-12 bg-skyLight rounded-b-[50px] py-28">
            <View className="absolute inset-0 flex items-center justify-between flex-row px-12">
              <Text className="text-skyDark text-2xl font-bold">Profile</Text>
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
                source={{
                  uri: `https://mjk-backend-production.up.railway.app/imagesdokter/${userData.foto_profil_masyarakat}`,
                }}
                className="w-32 h-32 rounded-full border-4 border-skyDark"
              />
            ) : (
              <View className="w-32 h-32 rounded-full border-4 border-skyDark items-center justify-center bg-gray-200">
                <Ionicons name="person" size={64} color="#0C4A6E" />
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
            <TouchableOpacity
              className="items-end"
              onPress={() => openModal("editprofil")}
            >
              <FontAwesome5 name="edit" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="font-bold text-lg text-skyDark">Nama</Text>
            <Text className="text-gray-700">{userData.nama_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">
              Username
            </Text>
            <Text className="text-gray-700">
              {userData.username_masyarakat}
            </Text>

            <Text className="font-bold text-lg text-skyDark mt-2">Email</Text>
            <Text className="text-gray-700">{userData.email_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">NIK</Text>
            <Text className="text-gray-700">{userData.nik_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">Alamat</Text>
            <Text className="text-gray-700">{userData.alamat_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">
              Nomor Telepon
            </Text>
            <Text className="text-gray-700">{userData.notlp_masyarakat}</Text>

            <Text className="font-bold text-lg text-skyDark mt-2">
              Jenis Kelamin
            </Text>
            <Text className="text-gray-700">
              {userData.jeniskelamin_masyarakat}
            </Text>

            <Text className="font-bold text-lg text-skyDark mt-2">
              Tanggal Lahir
            </Text>
            <Text className="text-gray-700">
              {formatTanggal(userData.tgl_lahir_masyarakat)}
            </Text>

            {/* Ganti Password */}
            <Text className="font-bold text-lg text-skyDark mt-4">
              Ganti Password
            </Text>
            <View className="w-full h-[2px] bg-skyDark" />
            <View className="flex flex-col items-center">
              <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
                Kata Sandi Lama
              </Text>
              <TextInput
                placeholder="Masukkan Kata Sandi Lama"
                secureTextEntry
                value={passwordLama}
                onChangeText={setPasswordLama}
                className="border-2 rounded-xl border-gray-400 p-2 w-full"
                placeholderTextColor="#888"
              />
              <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
                Kata Sandi Baru
              </Text>
              <TextInput
                placeholder="Masukkan Kata Sandi Baru"
                secureTextEntry
                value={passwordBaru}
                onChangeText={setPasswordBaru}
                className="border-2 rounded-xl border-gray-400 p-2 w-full"
                placeholderTextColor="#888"
              />
              <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
                Konfirmasi Kata Sandi Baru
              </Text>
              <TextInput
                placeholder="Masukkan Konfirmasi Kata Sandi Baru"
                secureTextEntry
                value={konfirmasiPassword}
                onChangeText={setKonfirmasiPassword}
                className="border-2 rounded-xl border-gray-400 p-2 w-full"
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                className="p-2 rounded-xl w-2/4 mt-6 bg-skyDark"
                onPress={handleGantiPassword}
              >
                <Text className="text-white text-center font-bold">Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Settings />
        </ScrollView>
      </View>
      <ModalTemplate
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      >
        <ModalContent
          modalType={modalType}
          onClose={() => setModalVisible(false)}
          onUpdateSuccess={() => {
            fetchUserData();
            setModalVisible(false);
          }}
        />
      </ModalTemplate>
    </Background>
  );
}
