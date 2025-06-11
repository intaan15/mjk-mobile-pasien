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
  Alert,
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

  const initialFormState = {
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
  };

  const [form, setForm] = useState(initialFormState);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState("");
  const [ktpUri, setKtpUri] = useState("");
  const [selfieUri, setSelfieUri] = useState("");

  // Fungsi untuk mereset semua state
  const resetAllStates = () => {
    setForm(initialFormState);
    setSelectedDate(null);
    setSelectedTab("");
    setKtpUri("");
    setSelfieUri("");
    setShowDatePicker(false);
  };

  // ** Restore form dari SecureStore saat komponen mount **
  useEffect(() => {
    const restoreFormData = async () => {
      try {
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

          // Sinkronkan tanggal lahir
          if (parsedForm.tglLahir) {
            const dateObj = new Date(parsedForm.tglLahir);
            setSelectedDate(dateObj);
          }
        }

        // Set URI untuk preview gambar
        if (savedKtp) {
          setKtpUri(savedKtp);
          setForm((prev) => ({ ...prev, fotoKTP: savedKtp }));
        }

        if (savedSelfie) {
          setSelfieUri(savedSelfie);
          setForm((prev) => ({ ...prev, selfieKTP: savedSelfie }));
        }
      } catch (error) {
        console.log("Error restoring form data:", error);
      }
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
      const fotoKTP = await SecureStore.getItemAsync("fotoKTP");
      const selfieKTP = await SecureStore.getItemAsync("selfieKTP");

      console.log("=== DEBUG INFO ===");
      console.log("Form data:", form);
      console.log("fotoKTP URI:", fotoKTP);
      console.log("selfieKTP URI:", selfieKTP);

      // Validasi form
      if (
        !form.nama ||
        !form.username ||
        !form.password ||
        !form.email ||
        !form.nik ||
        !form.alamat ||
        !form.notlp ||
        !form.jenisKelamin ||
        !form.tglLahir ||
        !fotoKTP ||
        !selfieKTP
      ) {
        Alert.alert("Gagal", "Semua data harus diisi.");
        return;
      }

      // Validasi khusus untuk NIK (harus 16 digit)
      if (form.nik.length !== 16) {
        Alert.alert("Gagal", "NIK harus 16 digit.");
        return;
      }

      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        Alert.alert("Gagal", "Format email tidak valid.");
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

      // Data teks - pastikan tidak ada nilai undefined atau null
      // Coba beberapa kemungkinan nama field yang berbeda
      formData.append("nama_masyarakat", form.nama.trim());
      formData.append("username_masyarakat", form.username.trim());
      formData.append("password_masyarakat", form.password);
      formData.append("email_masyarakat", form.email.trim().toLowerCase());
      formData.append("nik_masyarakat", form.nik.trim());
      formData.append("alamat_masyarakat", form.alamat.trim());
      formData.append("notlp_masyarakat", form.notlp.trim());
      formData.append("jeniskelamin_masyarakat", form.jenisKelamin);
      formData.append("tgl_lahir_masyarakat", form.tglLahir);

      // Alternative field names (uncomment if needed)
      // formData.append("nama", form.nama.trim());
      // formData.append("username", form.username.trim());
      // formData.append("password", form.password);
      // formData.append("email", form.email.trim().toLowerCase());
      // formData.append("nik", form.nik.trim());
      // formData.append("alamat", form.alamat.trim());
      // formData.append("no_telp", form.notlp.trim());
      // formData.append("jenis_kelamin", form.jenisKelamin);
      // formData.append("tanggal_lahir", form.tglLahir);

      // File foto KTP - try different approaches
      const ktpInfo = getFileInfo(fotoKTP);

      // Approach 1: Standard React Native format
      formData.append("foto_ktp_masyarakat", {
        uri: fotoKTP,
        type: ktpInfo.type,
        name: ktpInfo.name || `ktp_${Date.now()}.jpg`,
      } as any);

      // Approach 2: Alternative format (uncomment if approach 1 fails)
      // const ktpBlob = await fetch(fotoKTP).then(r => r.blob());
      // formData.append("foto_ktp_masyarakat", ktpBlob, ktpInfo.name || `ktp_${Date.now()}.jpg`);

      // File selfie KTP
      const selfieInfo = getFileInfo(selfieKTP);
      formData.append("selfie_ktp_masyarakat", {
        uri: selfieKTP,
        name: selfieInfo.name || `selfie_${Date.now()}.jpg`,
        type: selfieInfo.type,
      } as any);

      // Alternative selfie format (uncomment if needed)
      // const selfieBlob = await fetch(selfieKTP).then(r => r.blob());
      // formData.append("selfie_ktp_masyarakat", selfieBlob, selfieInfo.name || `selfie_${Date.now()}.jpg`);

      console.log("=== FORM DATA TO SEND ===");
      // Log form data untuk debugging
      const formDataObj = {};
      formData._parts.forEach(([key, value]) => {
        if (typeof value === "object" && value.uri) {
          formDataObj[key] = {
            uri: value.uri,
            type: value.type,
            name: value.name,
          };
        } else {
          formDataObj[key] = value;
        }
      });
      console.log("FormData contents:", formDataObj);

      const response = await axios.post(
        `${BASE_URL}/auth/register_masyarakat`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log("Registration successful:", response.data);

      // Jika registrasi berhasil
      Alert.alert("Berhasil", "Registrasi berhasil!", [
        {
          text: "OK",
          onPress: async () => {
            // Hapus data dari SecureStore
            await SecureStore.deleteItemAsync("formData");
            await SecureStore.deleteItemAsync("fotoKTP");
            await SecureStore.deleteItemAsync("selfieKTP");

            // Reset semua state
            resetAllStates();

            // Navigate ke signin
            router.replace("./signin");
          },
        },
      ]);
    } catch (error) {
      console.log("=== ERROR DETAILS ===");
      console.log("Error:", error);
      console.log("Error response:", error.response?.data);
      console.log("Error status:", error.response?.status);
      console.log("Error headers:", error.response?.headers);

      let errorMessage = "Terjadi kesalahan saat registrasi.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage =
          "Data yang dikirim tidak valid. Periksa kembali form Anda.";
      } else if (error.response?.status === 409) {
        errorMessage = "Username atau email sudah terdaftar.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Koneksi timeout. Periksa koneksi internet Anda.";
      }

      Alert.alert("Gagal", errorMessage);
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
      console.log("Error saving form:", error);
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
                  <Text className="text-[#06B400] ">
                    {ktpUri ? "✓ Foto KTP Sudah Diambil" : "Masukkan Foto KTP"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => saveFormAndNavigate("./panduanselfie")}
                  className="bg-transparent border-[#06B400] border-2 text-black px-4 py-3 rounded-xl"
                >
                  <Text className="text-[#06B400] ">
                    {selfieUri
                      ? "✓ Selfie KTP Sudah Diambil"
                      : "Selfie dengan KTP"}
                  </Text>
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
