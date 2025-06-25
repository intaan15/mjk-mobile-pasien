import { useState, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { BASE_URL, BASE_URL2 } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import { io } from "socket.io-client";

interface User {
  nama_dokter: string;
}

// Create socket instance outside component to avoid reconnections
const socket = io(`${BASE_URL2}`, {
  transports: ["websocket"],
});

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

  // Auto refresh chat list when new message arrives
  const refreshChatListOnNewMessage = useCallback(async () => {
    const storedId = await SecureStore.getItemAsync("userId");
    const token = await SecureStore.getItemAsync("userToken");
    const cleanedId = storedId?.replace(/"/g, "");
    
    if (cleanedId && token) {
      console.log("[DEBUG] 🔄 Auto-refreshing chat list due to new message");
      await fetchChatList(cleanedId, token);
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!masyarakatId) return;

    // Join room for this user
    socket.emit("joinRoom", masyarakatId);

    // Listen for new chat messages
    const handleNewMessage = (message: any) => {
      console.log("[DEBUG] 📨 New message received in chat list:", message);
      
      // Check if the message is for this user (either as sender or receiver)
      if (message.senderId === masyarakatId || message.receiverId === masyarakatId) {
        console.log("[DEBUG] 🔄 Message is relevant to current user, refreshing chat list");
        refreshChatListOnNewMessage();
      }
    };

    // Listen for chat list updates (if your backend emits this)
    const handleChatListUpdate = () => {
      console.log("[DEBUG] 📋 Chat list update received");
      refreshChatListOnNewMessage();
    };

    // Add socket listeners
    socket.on("chat message", handleNewMessage);
    socket.on("chatListUpdate", handleChatListUpdate);

    // Socket connection events
    socket.on("connect", () => {
      console.log("[DEBUG] 🔌 Socket connected in chat list");
    });

    socket.on("connect_error", (err) => {
      console.log("[DEBUG] ❌ Socket connection error in chat list:", err);
    });

    // Cleanup function
    return () => {
      socket.off("chat message", handleNewMessage);
      socket.off("chatListUpdate", handleChatListUpdate);
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [masyarakatId, refreshChatListOnNewMessage]);

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

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  // Additional effect to refresh when returning from chat screen
  useEffect(() => {
    const unsubscribe = router.addListener?.('focus', () => {
      // Refresh chat list when returning to this screen
      if (masyarakatId) {
        refreshChatListOnNewMessage();
      }
    });

    return unsubscribe;
  }, [masyarakatId, refreshChatListOnNewMessage, router]);

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