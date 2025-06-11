import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, TextInput } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ImagePickerComponent, {
  useImage,
  ImageProvider,
} from "../../components/picker/imagepicker";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import axios from "axios";
import DatePickerComponent from "../../components/picker/datepicker";
// import { BASE_URL } from "@env";
// const BASE_URL = "https://stg-konsultasi-dok.mojokertokab.go.id/api";
const BASE_URL = "http://10.52.170.158:3330/api";

interface ModalContentProps {
  modalType: string;
  onTimeSlotsChange?: (slots: string[]) => void;
  onClose?: () => void;
  onPickImage?: () => void;
  onOpenCamera?: () => void;
  onUpdateSuccess?: () => void;
}

interface User {
  nama_masyarakat: string;
  username_masyarakat: string;
  email_masyarakat: string;
  nik_masyarakat: string;
  alamat_masyarakat: string;
  notlp_masyarakat: string;
  jeniskelamin_masyarakat: string;
  tgl_lahir_masyarakat: string;
  foto_profil_masyarakat: string;
}

const ModalContent: React.FC<ModalContentProps> = ({
  modalType,
  onTimeSlotsChange,
  onClose,
  onPickImage,
  onUpdateSuccess,
  onOpenCamera,
}) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isPickerVisible, setPickerVisibility] = useState(false);
  const [isPickingStartTime, setIsPickingStartTime] = useState(true);

  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [noTlp, setNoTlp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    if (userData) {
      setNama(userData.nama_masyarakat || "");
      setUsername(userData.username_masyarakat || "");
      setEmail(userData.email_masyarakat || "");
      setNoTlp(userData.notlp_masyarakat || "");
      setAlamat(userData.alamat_masyarakat || "");
      setJenisKelamin(userData.jeniskelamin_masyarakat || "");
      setTglLahir(userData.tgl_lahir_masyarakat || "");
    }
  }, [userData]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const masyarakatId = await SecureStore.getItemAsync("userId");
        const token = await SecureStore.getItemAsync("userToken");
        if (!masyarakatId) {
          return;
        }

        const cleanedId = masyarakatId.replace(/"/g, "");
        const response = await axios.get(
          `${BASE_URL}/masyarakat/getbyid/${cleanedId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserData(response.data);
      } catch (error: any) {
        console.log("Gagal mengambil data profil:", error);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async () => {
    try {
      const masyarakatId = await SecureStore.getItemAsync("userId");
      const cleanedMasyarakatId = masyarakatId?.replace(/"/g, "");
      const token = await SecureStore.getItemAsync("userToken");

      const response = await axios.patch(
        `${BASE_URL}/masyarakat/update/${cleanedMasyarakatId}`,
        {
          nama_masyarakat: nama,
          username_masyarakat: username,
          email_masyarakat: email,
          notlp_masyarakat: noTlp,
          alamat_masyarakat: alamat,
          jeniskelamin_masyarakat: jenisKelamin,
          tgl_lahir_masyarakat: tglLahir,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onUpdateSuccess?.();
    } catch (error: any) {
      if (error.response) {
        console.log("Gagal update:", error.response.data);
      } else {
        console.log("Gagal update:", error.message);
      }
    }
  };

  const formatTime = (date: Date | null): string => {
    return date
      ? date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "--:--";
  };

  const generateTimeSlots = (): string[] => {
    if (!startTime || !endTime) return [];

    const slots: string[] = [];
    const currentTime = new Date(startTime);
    const end = new Date(endTime);

    if (end < currentTime) {
      end.setDate(end.getDate() + 1);
    }

    while (currentTime <= end) {
      slots.push(formatTime(currentTime));
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    return slots;
  };

  const router = useRouter();
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userId");
    onClose?.(); // Close modal
    router.replace("/screens/signin"); // Redirect to login screen
  };

  // Context for image picker
  const imageContext = useImage();
  const profileImage = imageContext?.profileImage;
  const setImage = imageContext?.setImage;

  const uploadImageToServer = async () => {
    if (!profileImage?.uri) {
      alert("Silakan pilih gambar terlebih dahulu.");
      return;
    }

    const uri = profileImage.uri;
    const fileName = uri.split("/").pop();
    const fileType = fileName?.split(".").pop();

    try {
      // Ambil data user
      const userId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("userToken");
      const cleanedUserId = userId?.replace(/"/g, "");
      const cleanedToken = token?.replace(/"/g, "");

      // Validasi data yang diperlukan
      if (!cleanedUserId) {
        alert("User ID tidak ditemukan. Silakan login ulang.");
        return;
      }

      if (!cleanedToken) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      console.log("UserId:", cleanedUserId);
      console.log("Token ada:", cleanedToken); // Log keberadaan token tanpa expose value

      const formData = new FormData();
      formData.append("image", {
        uri,
        name: fileName,
        type: `images/${fileType}`,
      } as any);
      formData.append("id", cleanedUserId);

      const response = await axios.post(
        // "http://10.52.170.158:3330/api/masyarakat/upload",
        `${BASE_URL}/masyarakat/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${cleanedToken}`,
          },
        }
      );

      console.log("Upload berhasil:", response.data);
      alert("Foto berhasil diunggah!");
      onUpdateSuccess?.();
    } catch (error: any) {
      console.log("Upload errorrrr:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        // Token expired atau tidak valid
        alert("Sesi Anda telah berakhir. Silakan login ulang.");

        // Hapus token yang expired
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("userId");

        // Redirect ke login (sesuaikan dengan navigation structure Anda)
        // navigation.navigate('Login');
      } else if (error.response?.status === 413) {
        alert(
          "Ukuran file terlalu besar. Silakan pilih gambar yang lebih kecil."
        );
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Gagal upload gambar";
        alert(`Upload gagal: ${errorMessage}`);
      }
    }
  };

  const handleUpload = async () => {
    await uploadImageToServer();
    onClose?.();
  };

  const handleDeleteAccount = async () => {
    try {
      const userId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("userToken");

      if (!userId || !token) {
        return;
      }

      const response = await axios.delete(
        `${BASE_URL}/masyarakat/delete/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        onClose?.();
        alert("akun anda berhasil dihapus");
        router.replace("/screens/signin");
      } else {
        console.log("Terjadi kesalahan saat menghapus akun.");
      }
    } catch (error) {
      console.log("Error deleting account:", error);
    }
  };

  switch (modalType) {
    // PROFIL
    case "gantifotoprofil":
      return (
        <View className="bg-white p-6 rounded-2xl w-full items-center">
          <Text className="text-xl font-semibold mb-4 text-center text-skyDark">
            Pilih Foto
          </Text>

          <TouchableOpacity
            className="flex-row items-center space-x-3 py-3 px-2 rounded-lg active:bg-gray-100 w-full"
            onPress={onPickImage}
          >
            <MaterialCommunityIcons name="image" size={24} color="#025F96" />
            <Text className="text-base text-skyDark"> Ambil dari Galeri</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center space-x-3 py-3 px-2 rounded-lg active:bg-gray-100 w-full"
            onPress={onOpenCamera}
          >
            <MaterialCommunityIcons name="camera" size={24} color="#025F96" />
            <Text className="text-base text-skyDark"> Ambil dari Kamera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-5 py-3 bg-green-700 rounded-xl w-full"
            onPress={uploadImageToServer}
          >
            <Text
              className="text-center text-white font-semibold text-base"
              onPress={handleUpload}
            >
              Unggah Foto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 py-3 bg-skyDark rounded-xl w-full"
            onPress={onClose}
          >
            <Text className="text-center text-white font-semibold text-base">
              Batal
            </Text>
          </TouchableOpacity>
        </View>
      );

    case "editprofil":
      return (
        <View>
          {/* Ganti Password */}
          <Text className="font-bold text-2xl text-skyDark mt-4 text-center">
            Ubah Profil
          </Text>
          {/* <View className="w-full h-[2px] bg-skyDark" /> */}
          <View className="flex flex-col items-center px-5">
            <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
              Nama
            </Text>
            <TextInput
              placeholder="Nama"
              // secureTextEntry
              value={nama}
              onChangeText={setNama}
              className="border-2 rounded-xl border-gray-400 p-2 w-full"
              placeholderTextColor="#888"
            />
            <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
              Nama Pengguna
            </Text>
            <TextInput
              placeholder="contoh123"
              // secureTextEntry
              value={username}
              onChangeText={setUsername}
              className="border-2 rounded-xl border-gray-400 p-2 w-full"
              placeholderTextColor="#888"
            />
            <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
              Email
            </Text>
            <TextInput
              placeholder="contoh@gmail.com"
              // secureTextEntry
              value={email}
              onChangeText={setEmail}
              className="border-2 rounded-xl border-gray-400 p-2 w-full"
              placeholderTextColor="#888"
            />
            <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
              Nomor Telepon
            </Text>
            <TextInput
              placeholder="0821312312312"
              // secureTextEntry
              value={noTlp}
              onChangeText={setNoTlp}
              className="border-2 rounded-xl border-gray-400 p-2 w-full"
              placeholderTextColor="#888"
            />
            <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
              Alamat
            </Text>
            <TextInput
              placeholder="Tulang"
              // secureTextEntry
              value={alamat}
              onChangeText={setAlamat}
              className="border-2 rounded-xl border-gray-400 p-2 w-full"
              placeholderTextColor="#888"
            />
            <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
              Jenis Kelamin
            </Text>
            <View className="flex flex-row rounded-xl border-2 border-[#ccc] overflow-hidden mt-1">
              {["Laki-laki", "Perempuan"].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  className={`w-1/2 p-2 items-center ${
                    jenisKelamin === gender ? "bg-skyDark" : "bg-white"
                  }`}
                  onPress={() => setJenisKelamin(gender)}
                >
                  <Text
                    className={`font-semibold ${
                      jenisKelamin === gender ? "text-white" : "text-skyDark"
                    }`}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="w-full pl-1 text-base font-semibold text-skyDark pt-2">
              Tanggal Lahir
            </Text>

            <View className="border-2 border-gray-400 rounded-xl w-full p-[4px]">
              <DatePickerComponent
                label="Tanggal Lahir"
                initialDate={tglLahir ? new Date(tglLahir) : null}
                onDateChange={(date) => {
                  const formatted = date.toISOString().split("T")[0];
                  setTglLahir(formatted);
                }}
              />
            </View>
            <View className="flex-row gap-12">
              <TouchableOpacity
                className="w-2/5 h-10 justify-center rounded-xl mt-6 mb-3 bg-red-700"
                onPress={onClose}
              >
                <Text className="text-white text-center font-bold">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-2/5 h-10 justify-center rounded-xl mt-6 mb-3 bg-skyDark"
                onPress={handleSubmit}
              >
                <Text className="text-white text-center font-bold">Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );

    case "keluarakun":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Anda yakin akan keluar?
          </Text>

          <View className="flex flex-row justify-between items-center px-10">
            <TouchableOpacity className="px-10 py-3" onPress={onClose}>
              <Text className=" text-center text-skyDark font-medium w-full">
                Batal
              </Text>
            </TouchableOpacity>
            <View className="w-[2px] h-10 text-center bg-skyDark my-5" />
            <TouchableOpacity className="px-10 py-3" onPress={handleLogout}>
              <Text className=" text-center text-red-500 font-medium">
                Keluar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );

    case "konfirm":
      return (
        <View className=" items-center">
          <TouchableOpacity
            onPress={onClose}
            className="text-center text-lg font-bold text-gray-700"
          >
            <Text>Jadwal anda berhasil diubah</Text>
          </TouchableOpacity>

          <View className="w-full h-1 bg-skyDark my-5" />

          <TouchableOpacity
            onPress={onClose}
            className=" text-center text-skyDark font-medium"
          >
            <Text>Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "hapusakun":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Anda yakin akan menghapus akun?
          </Text>

          <View className="flex flex-row justify-between items-center px-10">
            <TouchableOpacity className="px-10 py-3" onPress={onClose}>
              <Text className=" text-center text-skyDark font-medium w-full">
                Batal
              </Text>
            </TouchableOpacity>
            <View className="w-[2px] h-10 text-center bg-skyDark my-5" />
            <TouchableOpacity
              className="px-10 py-3"
              onPress={handleDeleteAccount}
            >
              <Text className=" text-center text-red-500 font-medium">
                Hapus
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );

    case "hapusprofil":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Anda yakin akan menghapus foto profil?
          </Text>

          <View className="flex flex-row justify-between items-center px-10">
            <TouchableOpacity className="px-10 py-3" onPress={onClose}>
              <Text className=" text-center text-skyDark font-medium w-full">
                Batal
              </Text>
            </TouchableOpacity>
            <View className="w-[2px] h-10 text-center bg-skyDark my-5" />
            <TouchableOpacity
              className="px-10 py-3"
              onPress={() => {
                setImage?.(null);
                onClose?.();
              }}
            >
              <Text className=" text-center text-red-500 font-medium">
                Hapus
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );

    // SIGNIN
    case "limiter":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Terlalu banyak percobaan login. Coba lagi nanti.
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "galat":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Galat! Terjadi kesalahan yang tidak terduga
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "masyarakatkosong":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Harap masukkan Nama Pengguna/NIK dan Kata Sandi
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "gadaakun":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Akun tidak ditemukan
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "pwsalah":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Kata Sandi salah
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "belumverif":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Akun anda masih dalam proses verisifkasi data
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "bodong":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Akun anda bodong
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "ditolak":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Akun anda ditolak
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    // RESET PASSWORD
    case "ubahberhasil":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Kata Sandi berhasil diubah
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "pwlamasalah":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Kata Sandi lama salah
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "pwtidakcocok":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Konfirmasi Kata Sandi tidak cocok
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    case "kolompwkosong":
      return (
        <View>
          <Text className="text-center text-lg font-bold text-skyDark">
            Semua kolom harus diisi
          </Text>

          <View className="w-full h-[2px] bg-skyDark mt-5 mb-3" />

          <TouchableOpacity
            className=" text-center text-skyDark font-medium w-full py-2"
            onPress={onClose}
          >
            <Text className="text-center text-skyDark">Oke</Text>
          </TouchableOpacity>
        </View>
      );

    default:
      return <Text>Modal tidak ditemukan.</Text>;
  }
};

export default ModalContent;
