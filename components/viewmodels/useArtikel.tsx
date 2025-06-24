import { useState, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@env";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const useArtikelViewModel = () => {
  const [artikels, setArtikels] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("Kesehatan");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchArtikels = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        router.replace("/screens/signin");
        return;
      }

      const response = await axios.get(`${BASE_URL}/artikel/getall`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setArtikels(response.data);
    } catch (error) {
      console.log("Error fetching artikels:", error);

      // Handle specific axios errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect
          await SecureStore.deleteItemAsync("userToken");
          await SecureStore.deleteItemAsync("userId");
          router.replace("/screens/signin");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchArtikels();
    setRefreshing(false);
  }, [fetchArtikels]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateToDetail = useCallback(
    (id: string) => {
      router.push({
        pathname: "/(tabs)/artikel/selengkapnya",
        params: { id },
      });
    },
    [router]
  );

  const getFilteredArtikels = useCallback(() => {
    return artikels.filter((item) => item.kategori_artikel === selectedTab);
  }, [artikels, selectedTab]);

  useFocusEffect(
    useCallback(() => {
      fetchArtikels();
    }, [fetchArtikels])
  );

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

  return {
    // State
    artikels,
    selectedTab,
    loading,
    refreshing,

    // Actions
    setSelectedTab,
    fetchArtikels,
    onRefresh,
    navigateBack,
    navigateToDetail,
    getFilteredArtikels,
    getImageUrl,
  };
};

interface ArtikelDetail {
  id: string;
  nama_artikel: string;
  detail_artikel: string;
  gambar_artikel: string;
  createdAt: string;
  // tambahkan field lain sesuai kebutuhan
}

interface ArtikelDetailState {
  artikel: ArtikelDetail | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

// Ganti dengan BASE_URL Anda

export function useArtikelDetail(artikelId: string) {
  const router = useRouter();
  const [artikel, setArtikel] = useState<ArtikelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArtikelDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        router.replace("/screens/signin");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/artikel/getbyid/${artikelId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setArtikel(response.data);
    } catch (error) {
      console.log("Error fetching artikel detail:", error);
      setError("Gagal memuat artikel. Silakan coba lagi.");
      setArtikel(null);
    } finally {
      setLoading(false);
    }
  }, [artikelId, router]);

  useEffect(() => {
    if (artikelId) {
      fetchArtikelDetail();
    }
  }, [fetchArtikelDetail, artikelId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchArtikelDetail();
    setRefreshing(false);
  }, [fetchArtikelDetail]);

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const getImageUrl = useCallback(
    (imagePath: string | null | undefined): string | null => {
      if (!imagePath) return null;

      if (imagePath.startsWith("http")) {
        return imagePath;
      }

      const baseUrlWithoutApi = BASE_URL.replace("/api", "");
      const cleanPath = imagePath.startsWith("/")
        ? imagePath.substring(1)
        : imagePath;

      return `${baseUrlWithoutApi}/${cleanPath}`;
    },
    []
  );

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateToArtikel = useCallback(() => {
    router.replace("/(tabs)/artikel");
  }, [router]);

  return {
    artikel,
    loading,
    error,
    refreshing,
    onRefresh,
    navigateBack,
    navigateToArtikel,
    formatDate,
    getImageUrl,
  };
}