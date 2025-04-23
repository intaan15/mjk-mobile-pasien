import React, { useState } from "react";
import {
  View, Text, TextInput, Image, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard, StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import Background from "../../components/background";
import Button from "../../components/button";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://mjk-backend-five.vercel.app/api/auth/login_masyarakat", {
        identifier_masyarakat: identifier,
        password_masyarakat: password,
      });
  
      const { token } = response.data;
      await SecureStore.setItemAsync("userToken", token);
      router.replace("/(tabs)/home");
    } catch (error: unknown) {
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
        className="flex-1 w-full h-full"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{
            flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20
          }} keyboardShouldPersistTaps="handled">
            <View className="items-center mb-24">
              <Image className="w-44 h-48" source={require("../../assets/images/logo.png")} resizeMode="contain" />
              <Text className="text-4xl font-bold text-skyDark">Masuk</Text>
            </View>
            <View className="w-full max-w-sm flex items-center">
              <View className="flex flex-col gap-4 w-full">
                <Text>Nama Pengguna atau NIK</Text>
                <TextInput
                  placeholder="Masukkan Username/NIK"
                  value={identifier}
                  onChangeText={setIdentifier}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Kata Sandi</Text>
                <TextInput
                  placeholder="Masukkan Kata Sandi"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
              </View>
              <Button text="Masuk" variant="success" className="w-5/6 mt-6" onPress={handleLogin} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Background>
  );
}