import { useState, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { BASE_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";

interface User {
  nama_dokter: string;
}

export const useChatListViewModel = () => {
  // States
  const [userData, setUserData] = useState<User | null>(null);
  const [masyarakatId, setMasyarakatId] = useState<string | null>(null);
  const [chatList, setChatList] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Utility function for image URL
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

  // Fetch chat list
  const fetchChatList = async (userId: string, token: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/chatlist/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enrichedChatList = response.data.map((chat: any) => {
        return {
          ...chat,
          nama_dokter: chat.participant?.nama || "Dokter",
          foto_profil_dokter: getImageUrl(chat.participant?.foto_profil),
          id_dokter: chat.participant?._id || "",
          lastMessageDate: chat.lastMessageDate || new Date().toISOString(),
        };
      });

      setChatList(enrichedChatList);
    } catch (error) {
      console.log("Gagal ambil chat list", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const storedId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("userToken");
      const cleanedId = storedId?.replace(/"/g, "");

      if (!cleanedId || !token) return;

      const response = await axios.get(
        `${BASE_URL}/masyarakat/getbyid/${cleanedId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.role !== "masyarakat") {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        router.replace("/screens/signin");
        return;
      }

      setUserData(response.data);
      setMasyarakatId(cleanedId);
      fetchChatList(cleanedId, token);
    } catch (error) {
      console.log("Gagal ambil data user", error);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const storedId = await SecureStore.getItemAsync("userId");
    const token = await SecureStore.getItemAsync("userToken");
    const cleanedId = storedId?.replace(/"/g, "");
    if (cleanedId && token) {
      await fetchChatList(cleanedId, token);
    }
    setRefreshing(false);
  }, []);

  // Navigation handler
  const handleChatPress = (chat: any) => {
    const currentUserId = masyarakatId;
    const otherParticipant = chat.participant;

    if (currentUserId && otherParticipant?._id) {
      console.log("[DEBUG] Navigation - Chat data:", {
        chat_id: chat._id,
        status: chat.status,
        dokter_id: otherParticipant._id,
      });

      router.push({
        pathname: "/chat/[id]",
        params: {
          senderId: currentUserId,
          receiverId: otherParticipant._id,
          jadwal_id: chat._id,
          status: chat.status,
          dokter_id: otherParticipant._id,
          chat_id: chat._id,
          receiver_name: chat.nama_dokter,
        },
      });
    } else {
      console.warn("Data participant tidak lengkap:", chat);
    }
  };

  // Back navigation handler
  const handleBack = () => {
    router.back();
  };

  // Focus effect
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  return {
    // States
    userData,
    masyarakatId,
    chatList,
    refreshing,
    loading,
    
    // Actions
    onRefresh,
    handleChatPress,
    handleBack,
    getImageUrl,
  };
};