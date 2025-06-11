import { useState, useCallback } from "react";
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

  const navigateToDetail = useCallback((id: string) => {
    router.push({
      pathname: "/(tabs)/artikel/selengkapnya",
      params: { id },
    });
  }, [router]);

  const getFilteredArtikels = useCallback(() => {
    return artikels.filter((item) => item.kategori_artikel === selectedTab);
  }, [artikels, selectedTab]);

  useFocusEffect(
    useCallback(() => {
      fetchArtikels();
    }, [fetchArtikels])
  );

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
  };
};