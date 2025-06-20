import { useState, useCallback } from "react";
import { Alert } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { BASE_URL } from "@env";

interface User {
  nama_masyarakat: string;
  username_masyarakat: string;
  email_masyarakat: string;
  nik_masyarakat: string;
  alamat_masyarakat: string;
  notlp_masyarakat: string;
  jeniskelamin_masyarakat: string;
  tgl_lahir_masyarakat: string;
  foto_ktp_masyarakat: string;
  selfie_ktp_masyarakat: string;
  foto_profil_masyarakat: string | null;
}

interface PasswordValidation {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export const useProfileViewModel = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [modalType, setModalType] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      minLength: false,
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSymbol: false,
    });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const router = useRouter();

  // Fungsi validasi password
  const validatePassword = (password: string) => {
    const validation: PasswordValidation = {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[@$!%*?&/#^()[\]{}<>]/.test(password),
    };

    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  // Update password baru dengan validasi
  const handlePasswordBaruChange = (value: string) => {
    setPasswordBaru(value);
    validatePassword(value);
    setShowPasswordValidation(value.length > 0);
  };

  // Fungsi helper untuk membuat URL gambar lengkap
  const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    const baseUrlWithoutApi = BASE_URL.replace("/api", "");

    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return `${baseUrlWithoutApi}/${cleanPath}`;
  };

  const fetchUserData = async () => {
    try {
      const userId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("userToken");

      if (!token) {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        router.replace("/screens/signin");
        return;
      }

      const cleanedUserId = userId?.replace(/"/g, "");
      if (cleanedUserId) {
        const response = await axios.get(
          `${BASE_URL}/masyarakat/getbyid/${cleanedUserId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
      }
    } catch (error) {
      console.log("Gagal mengambil data profil:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, []);

  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleGantiPassword = async () => {
    // Validasi input kosong
    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      setModalType("kolompwkosong");
      setModalVisible(true);
      return;
    }

    // Validasi password baru
    if (!validatePassword(passwordBaru)) {
      Alert.alert(
        "Password Tidak Valid",
        "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol (@$!%*?&/#^()[]{})"
      );
      return;
    }

    // Validasi konfirmasi password
    if (passwordBaru !== konfirmasiPassword) {
      setModalType("pwtidakcocok");
      setModalVisible(true);
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("userToken");

      if (!token) {
        setModalType("kolompwkosong");
        setModalVisible(true);
        return;
      }

      const res = await axios.patch(
        `${BASE_URL}/masyarakat/ubah-password`,
        {
          password_lama: passwordLama,
          password_baru: passwordBaru,
          konfirmasi_password_baru: konfirmasiPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setModalType("ubahberhasil");
      setModalVisible(true);
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
      setShowPasswordValidation(false);
      setPasswordValidation({
        minLength: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false,
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Terjadi kesalahan saat mengubah password";

      if (msg.includes("Password lama salah")) {
        setModalType("pwlamasalah");
      } else if (msg.includes("Konfirmasi password tidak cocok")) {
        setModalType("pwtidakcocok");
      } else if (msg.includes("Semua field harus diisi")) {
        setModalType("kolompwkosong");
      } else {
        setModalType("kolompwkosong");
      }
      setModalVisible(true);
    }
  };

  const openModal = (type: string) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const onUpdateSuccess = () => {
    fetchUserData();
    setModalVisible(false);
  };

  return {
    // State
    userData,
    passwordLama,
    passwordBaru,
    konfirmasiPassword,
    modalType,
    isModalVisible,
    refreshing,
    passwordValidation,
    showPasswordValidation,

    // Actions
    setPasswordLama,
    setPasswordBaru: handlePasswordBaruChange,
    setKonfirmasiPassword,
    setShowPasswordValidation,
    fetchUserData,
    onRefresh,
    handleGantiPassword,
    openModal,
    closeModal,
    onUpdateSuccess,
    getImageUrl,
    formatTanggal,
    validatePassword,
  };
};
