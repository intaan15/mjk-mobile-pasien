import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { BASE_URL } from "@env";

export interface JadwalItem {
  _id: string;
  masyarakat_id: {
    _id: string;
  };
  dokter_id: {
    nama_dokter: string;
    foto_profil_dokter?: string;
    rating_dokter: number;
  };
  tgl_konsul: string;
  jam_konsul: string;
  status_konsul:
    | "menunggu"
    | "berlangsung"
    | "diterima"
    | "selesai"
    | "ditolak";
}

export const useJadwalViewModel = () => {
  const router = useRouter();
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getDayName = (dateString: string): string => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const fetchJadwal = async (): Promise<void> => {
    try {
      const userId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("userToken");

      if (!token) {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        router.replace("/screens/signin");
        return;
      }

      if (!userId && !token) return;

      const res = await axios.get(`${BASE_URL}/jadwal/getall`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const filtered = res.data.filter((j: any) => {
        return j.masyarakat_id && j.masyarakat_id._id === userId;
      });

      setJadwalList(filtered);
    } catch (err: any) {
      console.log("Gagal fetch jadwal:", err.message);
    }
  };

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await fetchJadwal();
    setRefreshing(false);
  }, []);

  const handleBackPress = (): void => {
    router.back();
  };

  const getStatusBackgroundColor = (status: string): string => {
    switch (status) {
      case "diterima":
        return "bg-green-200";
      case "selesai":
        return "bg-gray-200";
      case "menunggu":
        return "bg-yellow-200";
      case "ditolak":
        return "bg-red-200";
      default:
        return "bg-blue-200";
    }
  };

  const getStatusTextColor = (status: string): string => {
    switch (status) {
      case "selesai":
        return "#000000";
      case "berlangsung":
        return "#025F96";
      case "diterima":
        return "#009113";
      case "menunggu":
        return "#BC6A00";
      default:
        return "#C30000";
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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

  const getProfileImageUri = (fotoProfile: string): string => {
    return `https://mjk-backend-production.up.railway.app/uploads/${fotoProfile}`;
  };

  // Initialize data when component focus
  useFocusEffect(
    useCallback(() => {
      const loadJadwal = async () => {
        setLoading(true);
        await fetchJadwal();
        setLoading(false);
      };

      loadJadwal();
    }, [])
  );

  return {
    // State
    jadwalList,
    loading,
    refreshing,

    // Actions
    onRefresh,
    handleBackPress,

    // Helpers
    getDayName,
    getStatusBackgroundColor,
    getStatusTextColor,
    formatDate,
    getProfileImageUri,
    getImageUrl,
  };
};
