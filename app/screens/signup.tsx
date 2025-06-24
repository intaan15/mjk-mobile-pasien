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
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import Background from "../../components/background";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import DatePickerComponent from "../../components/picker/datepicker";
import TabButton from "../../components/tabbutton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { BASE_URL } from "@env";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";


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
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState("");
  const [ktpUri, setKtpUri] = useState("");
  const [selfieUri, setSelfieUri] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
  });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  // State untuk pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Fungsi untuk mereset semua state
  const resetAllStates = () => {
    setForm(initialFormState);
    setSelectedDate(null);
    setSelectedTab("");
    setKtpUri("");
    setSelfieUri("");
    setShowDatePicker(false);
    setPasswordValidation({
      minLength: false,
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSymbol: false,
    });
    setShowPasswordValidation(false);
  };

  // Fungsi untuk menghapus semua data dari SecureStore
  const clearSecureStoreData = async () => {
    try {
      await SecureStore.deleteItemAsync("formData");
      await SecureStore.deleteItemAsync("fotoKTP");
      await SecureStore.deleteItemAsync("selfieKTP");
      console.log("SecureStore data cleared successfully");
    } catch (error) {
      console.log("Error clearing SecureStore data:", error);
    }
  };

  // Fungsi pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);

    // Tampilkan konfirmasi sebelum menghapus data
    Alert.alert(
      "Hapus Data Form",
      "Apakah Anda yakin ingin menghapus semua data yang telah diisi?",
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: () => setRefreshing(false),
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              // Hapus data dari SecureStore
              await clearSecureStoreData();

              // Reset semua state
              resetAllStates();

              // Berikan feedback kepada user
              Alert.alert("Berhasil", "Semua data form telah dihapus!");
            } catch (error) {
              console.log("Error during refresh:", error);
              Alert.alert("Error", "Terjadi kesalahan saat menghapus data");
            } finally {
              setRefreshing(false);
            }
          },
        },
      ]
    );
  };

  // Fungsi validasi password
  const validatePassword = (password) => {
    const validation = {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[@$!%*?&/#^()[\]{}<>]/.test(password),
    };

    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
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

          // Validasi password jika ada
          if (parsedForm.password) {
            validatePassword(parsedForm.password);
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

    // Validasi password secara real-time
    if (field === "password") {
      validatePassword(value);
      setShowPasswordValidation(value.length > 0);
    }
  };

  


  const compressImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 800 } }, // Resize to max width 800px
        ],
        {
          compress: 0.7, // Compress to 70% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.log("Error compressing image:", error);
      return uri; // Return original URI if compression fails
    }
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

      // Validasi password sesuai dengan backend
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&/#^()[\]{}<>]).{8,}$/;
      if (!passwordRegex.test(form.password)) {
        Alert.alert(
          "Password Tidak Valid",
          "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol (@$!%*?&/#^()[]{})"
        );
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

      // FIXED: Compress images before creating FormData
      console.log("Compressing images...");
      const compressedFotoKTP = await compressImage(fotoKTP);
      const compressedSelfieKTP = await compressImage(selfieKTP);

      // FIXED: Check file sizes after compression
      const ktpFileInfo = await FileSystem.getInfoAsync(compressedFotoKTP);
      const selfieFileInfo = await FileSystem.getInfoAsync(compressedSelfieKTP);

      const ktpSizeInMB = ktpFileInfo.size / (1024 * 1024);
      const selfieSizeInMB = selfieFileInfo.size / (1024 * 1024);
      const maxSizeInMB = 50; // Set reasonable limit (5MB per file)

      console.log(
        `KTP file size after compression: ${ktpSizeInMB.toFixed(2)} MB`
      );
      console.log(
        `Selfie file size after compression: ${selfieSizeInMB.toFixed(2)} MB`
      );

      if (ktpSizeInMB > maxSizeInMB) {
        Alert.alert(
          "File Terlalu Besar",
          `Ukuran foto KTP (${ktpSizeInMB.toFixed(
            2
          )} MB) terlalu besar. Maksimal ${maxSizeInMB} MB.`
        );
        return;
      }

      if (selfieSizeInMB > maxSizeInMB) {
        Alert.alert(
          "File Terlalu Besar",
          `Ukuran foto selfie (${selfieSizeInMB.toFixed(
            2
          )} MB) terlalu besar. Maksimal ${maxSizeInMB} MB.`
        );
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
      formData.append("nama_masyarakat", form.nama.trim());
      formData.append("username_masyarakat", form.username.trim());
      formData.append("password_masyarakat", form.password);
      formData.append("email_masyarakat", form.email.trim().toLowerCase());
      formData.append("nik_masyarakat", form.nik.trim());
      formData.append("alamat_masyarakat", form.alamat.trim());
      formData.append("notlp_masyarakat", form.notlp.trim());
      formData.append("jeniskelamin_masyarakat", form.jenisKelamin);
      formData.append("tgl_lahir_masyarakat", form.tglLahir);

      // FIXED: Use compressed images
      const ktpInfo = getFileInfo(compressedFotoKTP);
      formData.append("foto_ktp_masyarakat", {
        uri: compressedFotoKTP,
        type: ktpInfo.type,
        name: ktpInfo.name || `ktp_${Date.now()}.jpg`,
      } as any);

      const selfieInfo = getFileInfo(compressedSelfieKTP);
      formData.append("selfie_ktp_masyarakat", {
        uri: compressedSelfieKTP,
        name: selfieInfo.name || `selfie_${Date.now()}.jpg`,
        type: selfieInfo.type,
      } as any);

      console.log("=== FORM DATA TO SEND ===");
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

      // FIXED: Increased timeout and added upload progress
      const response = await axios.post(
        `${BASE_URL}/auth/register_masyarakat`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // Increased to 60 seconds
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
            // Optional: Update progress state here
            // setUploadProgress(percentCompleted);
          },
        }
      );

      console.log("Registration successful:", response.data);

      // Jika registrasi berhasil
      Alert.alert("Berhasil", "Registrasi berhasil!", [
        {
          text: "OK",
          onPress: async () => {
            // Hapus data dari SecureStore
            await clearSecureStoreData();

            // Reset semua state
            resetAllStates();

            // Navigate ke signin
            router.replace("./signin");
          },
        },
      ]);
    } catch (error: any) {
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
      } else if (error.response?.status === 413) {
        errorMessage =
          "Ukuran file terlalu besar. Coba gunakan foto yang lebih kecil.";
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

  // Komponen untuk menampilkan validasi password
  const PasswordValidationIndicator = () => {
    if (!showPasswordValidation) return null;

    const validationItems = [
      {
        key: "minLength",
        text: "Minimal 8 karakter",
        valid: passwordValidation.minLength,
      },
      {
        key: "hasLowercase",
        text: "Huruf kecil (a-z)",
        valid: passwordValidation.hasLowercase,
      },
      {
        key: "hasUppercase",
        text: "Huruf besar (A-Z)",
        valid: passwordValidation.hasUppercase,
      },
      {
        key: "hasNumber",
        text: "Angka (0-9)",
        valid: passwordValidation.hasNumber,
      },
      {
        key: "hasSymbol",
        text: "Simbol (@$!%*?&/#^()[]{})",
        valid: passwordValidation.hasSymbol,
      },
    ];

    return (
      <View className="w-full mt-2 p-3 rounded-lg">
        <Text className="text-sm font-bold text-skyDark mb-2">
          Syarat Password:
        </Text>
        {validationItems.map((item) => (
          <View key={item.key} className="flex-row items-center mb-1">
            <Ionicons
              name={item.valid ? "checkmark-circle" : "close-circle"}
              size={16}
              color={item.valid ? "#10B981" : "#EF4444"}
            />
            <Text
              className={`ml-2 text-sm ${
                item.valid ? "text-skyDark" : "text-skyDark"
              }`}
            >
              {item.text}
            </Text>
          </View>
        ))}
      </View>
    );
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#025F96"]} // Android
                tintColor="#025F96" // iOS
                title="Tarik untuk menghapus data form" // iOS
                titleColor="#025F96" // iOS
              />
            }
          >
            {/* Header dengan informasi pull-to-refresh */}
            <View className="w-full max-w-sm mb-4 px-4">
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <View className="flex-row items-center">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#025F96"
                  />
                  <Text className="ml-2 text-sm text-blue-800 flex-1">
                    Tarik ke bawah untuk menghapus semua data form
                  </Text>
                </View>
              </View>
            </View>

            <View className="items-center pt-12 pb-6">
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
                <View className="relative">
                  <TextInput
                    placeholder="Masukkan Kata Sandi"
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                    onFocus={() => setShowPasswordValidation(true)}
                    className="bg-transparent border-2 border-gray-400 text-black px-4 py-3 pr-12 rounded-xl"
                    placeholderTextColor="#ccc"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={24}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>

                <PasswordValidationIndicator />

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
