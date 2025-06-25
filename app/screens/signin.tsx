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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Background from "../../components/background";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import ModalTemplate from "../../components/modals/ModalTemplate";
import ModalContent from "../../components/modals/ModalContent";
import { BASE_URL } from "@env";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");

  const handleLogin = async () => {
    if (!identifier || !password) {
      setModalType("masyarakatkosong");
      setModalVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/login_masyarakat`, {
        identifier_masyarakat: identifier,
        password_masyarakat: password,
      });

      const { token, userId } = response.data;
      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userId", userId);
      router.replace("/(tabs)/home");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 429) {
          setModalType("limiter");
        } else if (status === 400) {
          if (message === "Akun tidak ditemukan") {
            setModalType("gadaakun");
          } else if (message === "Password salah") {
            setModalType("pwsalah");
          } else {
            // setModalType("galat");
          }
        } else if (status === 403) {
          if (message === "Akun belum diverifikasi") {
            setModalType("belumverif");
          } else if (message === "Akun anda ditolak") {
            setModalType("ditolak");
          } else if (message === "Akun anda bodong") {
            setModalType("bodong");
          } else {
            // setModalType("galat");
          }
        } else {
          // setModalType("galat");
        }
      } else {
        // setModalType("galat");
      }

      setModalVisible(true);
    } finally {
      setIsLoading(false);
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
              <View className="relative">
                <TextInput
                  placeholder="Masukkan Kata Sandi"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#999"
                  className="border-2 border-gray-300 p-3 pr-12 rounded-xl mb-6 text-black"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[9px]"
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={24}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className={`py-3 rounded-xl items-center mb-4 w-64 self-center flex-row justify-center ${
                  isLoading ? "bg-[#0459708a]" : "bg-[#025F96]"
                }`}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#ffffff"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white text-lg">Loading...</Text>
                  </>
                ) : (
                  <Text className="text-white text-lg">Masuk</Text>
                )}
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
      <ModalTemplate
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <ModalContent
          modalType={modalType}
          onClose={() => setModalVisible(false)}
        />
      </ModalTemplate>
    </Background>
  );
}
