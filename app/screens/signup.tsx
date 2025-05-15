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

const Register = () => {
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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState("");


  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handlePickImage = async (field) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Izin akses galeri ditolak!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleInputChange(field, result.assets[0].uri);
    }
  };


  const handleRegister = async () => {

    const isEmptyField = Object.values(form).some((val) => val == null || val.trim() === "");
    
    try {
      const payload = {
        nama_masyarakat: form.nama,
        username_masyarakat: form.username,
        password_masyarakat: form.password,
        email_masyarakat: form.email,
        nik_masyarakat: form.nik,
        alamat_masyarakat: form.alamat,
        notlp_masyarakat: form.notlp,
        jeniskelamin_masyarakat: form.jenisKelamin,
        tgl_lahir_masyarakat: form.tglLahir,
        foto_ktp_masyarakat: "foto ktp.jpg", 
        selfie_ktp_masyarakat: "selfie ktp.jpg", 
        foto_profil_masyarakat: "foto_profil.jpg", 
      };

      const response = await axios.post(
        "http://10.52.170.111:3330/api/auth/register_masyarakat",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Registrasi berhasil!");
      router.replace("./signin");
    } catch (error) {
      // console.error(error.response?.data || error.message);
      alert(
        "Gagal registrasi: " + ((error as any).response?.data?.message || (error as any).message)
      );
    }
  };

  const handleGenderSelect = (gender) => {
    setSelectedTab(gender);
    handleInputChange("jenisKelamin", gender);
  };

  const handleDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) {
      setSelectedDate(selected);
      const formattedDate = selected.toISOString().split("T")[0];
      handleInputChange("tglLahir", formattedDate);
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
                  value={form.nama}
                  onChangeText={(text) => handleInputChange("nama", text)}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Nama Pengguna</Text>
                <TextInput
                  placeholder="Masukkan Nama Pengguna"
                  value={form.username}
                  onChangeText={(text) => handleInputChange("username", text)}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Kata Sandi</Text>
                <TextInput
                  placeholder="Masukkan Kata Sandi"
                  secureTextEntry
                  value={form.password}
                  onChangeText={(text) => handleInputChange("password", text)}
                  className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Email</Text>
                <TextInput
                  placeholder="Masukkan Email"
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>NIK</Text>
                <TextInput
                  placeholder="Masukkan NIK"
                  keyboardType="numeric"
                  value={form.nik}
                  onChangeText={(text) => handleInputChange("nik", text)}
                  className="bg-transparent border-gray-400 border-2 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Alamat</Text>
                <TextInput
                  placeholder="Masukkan Alamat"
                  value={form.alamat}
                  onChangeText={(text) => handleInputChange("alamat", text)}
                  className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl"
                  placeholderTextColor="#ccc"
                />
                <Text>Nomor Telepon</Text>
                <TextInput
                  placeholder="Masukkan Nomor Telepon"
                  keyboardType="phone-pad"
                  value={form.notlp}
                  onChangeText={(text) => handleInputChange("notlp", text)}
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
                    {["Laki-laki", "Perempuan"].map((tab) => (
                      <TabButton
                        key={tab}
                        label={tab}
                        isActive={selectedTab === tab}
                        onPress={() => handleGenderSelect(tab)} // pakai fungsi ini
                      />
                    ))}
                  </View>
                </View>

                <View className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl">
                  <DatePickerComponent
                    label="Tanggal Terpilih"
                    onDateChange={(date) => {
                      setSelectedDate(date);
                      handleInputChange(
                        "tglLahir",
                        date.toISOString().split("T")[0]
                      );
                    }}
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
                  onPress={() => router.push("./panduanselfie")}
                  // value={identifier}
                  // onChangeText={setIdentifier}
                  className="bg-transparent border-[#06B400] border-2 text-black px-4 py-3 rounded-xl"
                >
                  <Text className="text-[#06B400] ">Selfie dengan KTP</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="bg-skyDark py-3 px-6 rounded-3xl mt-6 w-4/6 "
                onPress={handleRegister}
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
};

export default Register;
