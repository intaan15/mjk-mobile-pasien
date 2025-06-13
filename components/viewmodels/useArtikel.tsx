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

export interface ArtikelDetail {
  id: string;
  nama_artikel: string;
  detail_artikel: string;
  gambar_artikel: string;
  createdAt: string;
}

export interface ArtikelDetailState {
  artikel: ArtikelDetail | null;
  loading: boolean;
  error: string | null;
}

export class ArtikelDetailViewModel {
  private router = useRouter();
  private artikelId: string;

  constructor(artikelId: string) {
    this.artikelId = artikelId;
  }

  useArtikelDetail(): ArtikelDetailState & {
    navigateBack: () => void;
    navigateToArtikel: () => void;
  } {
    const [artikel, setArtikel] = useState<ArtikelDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      this.fetchArtikelDetail(setArtikel, setLoading, setError);
    }, [this.artikelId]);

    return {
      artikel,
      loading,
      error,
      navigateBack: () => this.router.back(),
      navigateToArtikel: () => this.router.replace("/(tabs)/artikel"),
    };
  }

  private async fetchArtikelDetail(
    setArtikel: (artikel: ArtikelDetail | null) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
  ) {
    try {
      setLoading(true);
      setError(null);

      const token = await SecureStore.getItemAsync("userToken");

      if (!token) {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        this.router.replace("/screens/signin");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/artikel/getbyid/${this.artikelId}`,
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
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getImageUrl = (imagePath: string | null | undefined): string | null => {
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
}
