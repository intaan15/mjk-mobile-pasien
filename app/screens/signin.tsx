import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import Background from "../../components/background";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "https://mjk-backend-production.up.railway.app/api/auth/login_masyarakat",
        {
          identifier_masyarakat: identifier,
          password_masyarakat: password,
        }
      );

      const { token, userId } = response.data;
      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userId", userId);
      router.replace("/(tabs)/home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          alert(`Error: ${error.response.data.message || "Gagal login"}`);
        } else if (error.request) {
          alert("Tidak ada respon dari server. Coba lagi nanti.");
        } else {
          alert(`Terjadi kesalahan: ${error.message}`);
        }
      } else {
        alert("Terjadi kesalahan yang tidak terduga: " + error);
      }
    }
  };

  return (
    <Background>
      <StatusBar backgroundColor="#f6f6f6" barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 20,
              paddingVertical: 40,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center mb-6 pb-24">
              <Image
                source={require("../../assets/images/logo.png")}
                className="w-60 h-44"
                resizeMode="contain"
              />
              <Text className="text-[32px] font-bold text-[#025F96]">
                Masuk
              </Text>
            </View>

            <View className="w-full px-8">
              <Text className="mb-2 text-base text-black">
                Nama Pengguna atau NIK
              </Text>
              <TextInput
                placeholder="Masukkan Username/NIK"
                value={identifier}
                onChangeText={setIdentifier}
                placeholderTextColor="#999"
                className="border-2 border-gray-300 p-3 rounded-xl mb-4 text-black"
              />

              <Text className="mb-2 text-base text-black">Kata Sandi</Text>
              <TextInput
                placeholder="Masukkan Kata Sandi"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
                className="border-2 border-gray-300 p-3 rounded-xl mb-6 text-black"
              />

              <TouchableOpacity
                className="bg-[#025F96] py-3 rounded-xl items-center mb-4 w-64 self-center"
                onPress={handleLogin}
              >
                <Text className="text-white text-lg">Masuk</Text>
              </TouchableOpacity>

              <View className="flex-row justify-center">
                <Text className="text-black">Belum punya akun? </Text>
                <TouchableOpacity onPress={() => router.replace("./signup")}>
                  <Text className="text-[#025F96] underline">Registrasi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Background>
  );
}
