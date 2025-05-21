import React, { useState, useEffect } from "react";
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
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import Background from "../../components/background";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import DatePickerComponent from "../../components/picker/datepicker";
import TabButton from "../../components/tabbutton";
import { useLocalSearchParams } from "expo-router";
import { BASE_URL } from "@env";

const Register = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

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
    fotoKTP: "",
    selfieKTP: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState("");
  const [ktpUri, setKtpUri] = useState("");
  const [selfieUri, setSelfieUri] = useState("");


  // ** Restore form dari SecureStore saat komponen mount **
  useEffect(() => {
    const restoreFormData = async () => {
      const savedForm = await SecureStore.getItemAsync("formData");
      const savedKtp = await SecureStore.getItemAsync("fotoKTP");
      const savedSelfie = await SecureStore.getItemAsync("selfieKTP");

      if (savedForm) {
        const parsedForm = JSON.parse(savedForm);
        setForm(parsedForm);

        // Sinkronkan selectedTab untuk jenis kelamin
        if (parsedForm.jenisKelamin) {
          setSelectedTab(parsedForm.jenisKelamin);
        }
        if (parsedForm.tglLahir) {
          const dateObj = new Date(parsedForm.tglLahir);
          setSelectedDate(dateObj);
        }
        
      }

      if (savedKtp) setKtpUri(savedKtp);
      if (savedSelfie) setSelfieUri(savedSelfie);
    };

    restoreFormData();
  }, []);
  
  

  const handleInputChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    try {
      const userId = await SecureStore.getItemAsync("userId");
      const fotoKTP = await SecureStore.getItemAsync("fotoKTP");
      const selfieKTP = await SecureStore.getItemAsync("selfieKTP");
      const token = await SecureStore.getItemAsync("userToken");

      if (!userId || !fotoKTP || !selfieKTP) {
        Alert.alert("Gagal", "Semua data harus diisi.");
        return;
      }

      const getFileInfo = (uri) => {
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const ext = match?.[1];
        const mimeType =
          ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "png"
            ? "image/png"
            : "application/octet-stream";
        return { name: filename, type: mimeType };
      };

      const formData = new FormData();

      // Data teks
      formData.append("nama_masyarakat", form.nama);
      formData.append("username_masyarakat", form.username);
      formData.append("password_masyarakat", form.password);
      formData.append("email_masyarakat", form.email);
      formData.append("nik_masyarakat", form.nik);
      formData.append("alamat_masyarakat", form.alamat);
      formData.append("notlp_masyarakat", form.notlp);
      formData.append("jeniskelamin_masyarakat", form.jenisKelamin);
      formData.append("tgl_lahir_masyarakat", form.tglLahir);

      // File foto KTP
      const ktpInfo = getFileInfo(fotoKTP);
      formData.append("foto_ktp_masyarakat", {
        uri: fotoKTP,
        type: ktpInfo.type,
        name: ktpInfo.name,
      } as any);

      // File selfie KTP
      const selfieInfo = getFileInfo(selfieKTP);
      formData.append("selfie_ktp_masyarakat", {
        uri: selfieKTP,
        name: selfieInfo.name,
        type: selfieInfo.type,
      } as any);

      console.log("Form data sebelum kirim:", {
        nama: form.nama,
        username: form.username,
        password: form.password,
        email: form.email,
        nik: form.nik,
        alamat: form.alamat,
        notlp: form.notlp,
        jenisKelamin: form.jenisKelamin,
        tglLahir: form.tglLahir,
        fotoKTP,
        selfieKTP,
      });
      

      const response = await axios.post(
        `${BASE_URL}/auth/register_masyarakat`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Registrasi berhasil!");
      await SecureStore.deleteItemAsync("formData");
      await SecureStore.deleteItemAsync("fotoKTP");
      await SecureStore.deleteItemAsync("selfieKTP");
      router.replace("./signin");
    } catch (error: any) {
      console.log("Error:", error);
      console.log("Error response:", error.response?.data);
      alert(
        "Gagal registrasi: " + (error.response?.data?.message || error.message)
      );
    }
  };
  

  // Gender select handler
  const handleGenderSelect = (gender) => {
    setSelectedTab(gender);
    handleInputChange("jenisKelamin", gender);
  };

  // Date change handler
  const handleDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) {
      setSelectedDate(selected);
      const formattedDate = selected.toISOString().split("T")[0];
      handleInputChange("tglLahir", formattedDate);
    }
  };
  const saveFormAndNavigate = async (path) => {
    try {
      await SecureStore.setItemAsync("formData", JSON.stringify(form));
      router.push(path);
    } catch (error: any) {
      console.log("Error:", error);
      console.log("Error response:", error.response?.data);

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
                <View className="bg-transparent border-gray-400 border-2 text-black  rounded-xl">
                  <View className="flex flex-row rounded-xl border-2 border-[#ccc] overflow-hidden">
                    {["Laki-laki", "Perempuan"].map((tab) => (
                      <TabButton
                        key={tab}
                        label={tab}
                        isActive={selectedTab === tab}
                        onPress={() => handleGenderSelect(tab)}
                      />
                    ))}
                  </View>
                </View>

                <Text>Tanggal Lahir</Text>
                <View className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 rounded-xl">
                  <DatePickerComponent
                    label="Tanggal Terpilih"
                    initialDate={selectedDate}
                    onDateChange={(date) => {
                      setSelectedDate(date);
                      handleInputChange(
                        "tglLahir",
                        date.toISOString().split("T")[0]
                      );
                    }}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => saveFormAndNavigate("./panduanktp")}
                  className="bg-transparent border-[#06B400] border-2 text-black px-4 py-3 rounded-xl"
                >
                  <Text className="text-[#06B400] ">Masukkan Foto KTP</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => saveFormAndNavigate("./panduanselfie")}
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
