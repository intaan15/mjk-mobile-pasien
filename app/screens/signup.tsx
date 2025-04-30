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
import * as ImagePicker from "expo-image-picker";
import DatePickerComponent from "../../components/picker/datepicker";
import TabButton from "../../components/tabbutton";



export default function Register() {
  const [selectedTab, setSelectedTab] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
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
                <View
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-gray-400 border-2 text-black  rounded-xl"
                >
                  <View className="flex flex-row rounded-xl border-2 border-[#ccc] overflow-hidden">
                    {["Laki Laki", "Perempuan"].map((tab) => (
                      <TabButton
                        key={tab}
                        label={tab}
                        isActive={selectedTab === tab}
                        onPress={() => setSelectedTab(tab)}
                      />
                    ))}
                  </View>
                </View>

                <Text>Tanggal Lahir</Text>
                <View className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl">
                  {/* secureTextEntry // value={password}
                  // onChangeText={setPassword}
                  
                  px-4 py-3 rounded-xl" placeholderTextColor="#ccc" */}
                  <DatePickerComponent
                    label="Tanggal Terpilih"
                    onDateChange={(date) => setSelectedDate(date)}
                  />
                </View>
                <Text>Foto KTP</Text>
                <TouchableOpacity
                  onPress={() => router.push("./panduanktp")}
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-[#06B400]  border-2 text-black px-4 py-3 rounded-xl"
                >
                  <Text className="text-[#06B400] ">Masukkan Foto KTP</Text>
                </TouchableOpacity>
                <Text>Selfie dengan KTP</Text>
                <TouchableOpacity
                  onPress={() => router.push("./panduanktp")}
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-[#06B400] border-2 text-black px-4 py-3 rounded-xl"
                >
                  <Text className="text-[#06B400] ">Selfie dengan KTP</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="bg-skyDark py-3 px-6 rounded-3xl mt-6 w-4/6 "
                // onPress={"handleLogin"}
              >
                <Text className="text-xl font-normal text-white text-center">
                  Daftar
                </Text>
              </TouchableOpacity>
              <View className="flex-row pt-4 pb-24">
                <Text>Sudah punya akun? </Text>
                <TouchableOpacity onPress={() => router.replace("./signin")}>
                  <Text
                    style={{
                      color: "#025F96",
                      textDecorationLine: "underline",
                    }}
                  >
                    Login
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
