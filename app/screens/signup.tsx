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
import Button from "../../components/button";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    username: "",
    password: "",
    email: "",
    nik: "",
    alamat: "",
    notlp: "",
    jenisKelamin: "",
    tglLahir: "",
    fotoKTP: null,
    selfieKTP: null,
  });

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const pickImage = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setForm({ ...form, [field]: result.assets[0].uri });
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
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 20,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center pt-24 pb-6">
              <Image
                className="w-44 h-48"
                source={require("../../assets/images/logo.png")}
                resizeMode="contain"
              />
              <Text className="text-4xl font-bold text-skyDark">
                Registrasi
              </Text>
            </View>
            <View className="w-full max-w-sm flex items-center">
              <View className="flex flex-col gap-4 w-full">
                <Text>Nama</Text>
                <TextInput
                  placeholder="Masukkan Nama"
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Nama Pengguna</Text>
                <TextInput
                  placeholder="Masukkan Nama Pengguna"
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Kata Sandi</Text>
                <TextInput
                  placeholder="Masukkan Kata Sandi"
                  secureTextEntry
                  // value={password}
                  // onChangeText={setPassword}
                  className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Email</Text>
                <TextInput
                  placeholder="Masukkan Email"
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>NIK</Text>
                <TextInput
                  placeholder="Masukkan NIK"
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Alamat</Text>
                <TextInput
                  placeholder="Masukkan Alamat"
                  secureTextEntry
                  // value={password}
                  // onChangeText={setPassword}
                  className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Nomor Telepon</Text>
                <TextInput
                  placeholder="Masukkan Nomor Telepon"
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Jenis Kelamin</Text>
                <TextInput
                  placeholder="Masukkan Jenis Kelamin"
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Tanggal Lahir</Text>
                <TextInput
                  placeholder="Masukkan Tanggal Lahir"
                  secureTextEntry
                  // value={password}
                  // onChangeText={setPassword}
                  className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Foto KTP</Text>
                <TextInput
                  placeholder="Masukkan Foto KTP"
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Selfie dengan KTP</Text>
                <TextInput
                  placeholder="Masukkan Selfie dengan KTP"
                  secureTextEntry
                  // value={password}
                  // onChangeText={setPassword}
                  className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
              </View>
              <Button
                text="Daftar"
                variant="success"
                className="w-5/6 mt-6"
                onPress={""}
              />
              <View className="flex-row pt-4 pb-24">
                <Text>Sudah punya akun? </Text>
                <TouchableOpacity onPress={() => router.replace("./signin")}>
                  <Text
                    style={{
                      color: "#025F96",
                      textDecorationLine: "underline",
                    }}
                  >Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Background>
  );
}
