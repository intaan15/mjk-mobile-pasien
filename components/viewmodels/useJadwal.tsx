import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { AppState } from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { BASE_URL } from "@env";

export type Rating = {
  _id: string;
  jadwal: string;
  masyarakat_id: {
    _id: string;
    nama: string;
  };
  dokter_id: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export interface JadwalItem {
  _id: string;
  masyarakat_id: {
    _id: string;
  };
  dokter_id: {
    _id: string;
    nama_dokter: string;
    foto_profil_dokter?: string;
    rating_dokter?: number | null;
  };
  tgl_konsul: string;
  jam_konsul: string;
  keluhan_pasien: string;
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
  const [doctorRatings, setDoctorRatings] = useState<{ [key: string]: number }>(
    {}
  );
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [fetchedDoctorIds, setFetchedDoctorIds] = useState<Set<string>>(
    new Set()
  );
  const [refreshing, setRefreshing] = useState(false);

  // Auto refresh states
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

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

  const fetchJadwal = async (silent: boolean = false): Promise<void> => {
    try {
      if (!silent) {
        setLoading(true);
      }

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
        return (
          j &&
          j._id &&
          j.masyarakat_id &&
          j.masyarakat_id._id === userId &&
          j.dokter_id &&
          typeof j.dokter_id === "object" &&
          j.dokter_id._id &&
          j.dokter_id.nama_dokter &&
          j.tgl_konsul &&
          j.jam_konsul &&
          j.status_konsul &&
          [
            "menunggu",
            "berlangsung",
            "diterima",
            "selesai",
            "ditolak",
          ].includes(j.status_konsul)
        );
      });

      // Check if data has changed
      const hasDataChanged =
        JSON.stringify(filtered) !== JSON.stringify(jadwalList);

      if (hasDataChanged) {
        setJadwalList(filtered);
      }
    } catch (err: any) {
      console.log("Gagal fetch jadwal:", err.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Auto refresh function
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (autoRefreshEnabled) {
      intervalRef.current = setInterval(() => {
        // Only auto refresh if app is in foreground
        if (appStateRef.current === "active") {
          fetchJadwal(true); // Silent refresh
        }
      }, 10000); // Check every 10 seconds, adjust as needed
    }
  }, [autoRefreshEnabled, jadwalList]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground, do a refresh
        fetchJadwal(true);
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  // Start/stop auto refresh based on focus
  useFocusEffect(
    useCallback(() => {
      startAutoRefresh();

      return () => {
        stopAutoRefresh();
      };
    }, [startAutoRefresh, stopAutoRefresh])
  );

  // Calculate average rating
  const calculateAverageRating = (ratings: Rating[]): number => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const fetchDoctorRatings = useCallback(async () => {
    if (jadwalList.length === 0) return;

    const unfetchedDoctors = jadwalList
      .filter((jadwal) => !fetchedDoctorIds.has(jadwal.dokter_id._id))
      .map((jadwal) => jadwal.dokter_id);

    if (unfetchedDoctors.length === 0) return;

    setRatingsLoading(true);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        console.log("Token tidak ditemukan");
        return;
      }

      const ratingsPromises = unfetchedDoctors.map(async (dokter) => {
        try {
          const response = await axios.get(
            `${BASE_URL}/rating/dokter/${dokter._id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success && response.data.data) {
            const averageRating = calculateAverageRating(response.data.data);
            return { doctorId: dokter._id, rating: averageRating };
          }
          return { doctorId: dokter._id, rating: dokter.rating_dokter || 0 };
        } catch (error: any) {
          console.log(
            `Gagal mengambil rating untuk dokter ${dokter._id}:`,
            error.message
          );
          return { doctorId: dokter._id, rating: dokter.rating_dokter || 0 };
        }
      });

      const ratingsResults = await Promise.all(ratingsPromises);
      const ratingsMap: { [key: string]: number } = { ...doctorRatings };

      ratingsResults.forEach(({ doctorId, rating }) => {
        ratingsMap[doctorId] = rating;
      });

      setDoctorRatings(ratingsMap);
      setFetchedDoctorIds(
        (prev) => new Set([...prev, ...unfetchedDoctors.map((d) => d._id)])
      );
    } catch (error: any) {
      console.log("Gagal mengambil rating dokter:", error.message);
    } finally {
      setRatingsLoading(false);
    }
  }, [jadwalList, fetchedDoctorIds, doctorRatings]);

  useEffect(() => {
    if (jadwalList.length > 0 && !loading) {
      fetchDoctorRatings();
    }
  }, [jadwalList, loading, fetchDoctorRatings]);

  const getDisplayRating = useCallback(
    (dokter: JadwalItem["dokter_id"]): number => {
      const apiRating = doctorRatings[dokter._id];
      return apiRating !== undefined ? apiRating : dokter.rating_dokter || 0;
    },
    [doctorRatings]
  );

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await fetchJadwal();
    setRefreshing(false);
  }, []);

  const handleBackPress = (): void => {
    stopAutoRefresh(); // Stop auto refresh when leaving the screen
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

  const formatRating = (rating: number): string => {
    const clampedRating = Math.min(rating, 5);
    if (clampedRating % 1 === 0) {
      return clampedRating.toString();
    }
    return clampedRating.toFixed(1);
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    // State
    jadwalList,
    loading,
    refreshing,
    ratingsLoading,
    autoRefreshEnabled,

    // Actions
    onRefresh,
    handleBackPress,
    setAutoRefreshEnabled,

    // Helpers
    getDayName,
    getDisplayRating,
    getStatusBackgroundColor,
    calculateAverageRating,
    fetchDoctorRatings,
    getStatusTextColor,
    formatDate,
    getImageUrl,
    formatRating,
  };
};
