import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import Background from "../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { io } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { BASE_URL, BASE_URL2 } from "@env";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams } from "expo-router";

const socket = io(`${BASE_URL2}`, {
  transports: ["websocket"],
});

export default function ChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [userId, setUserId] = useState("");
  const { receiverId } = useLocalSearchParams();
  const [userRole, setUserRole] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [username, setUsername] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [jadwalId, setJadwalId] = useState(null);
  const isSendReady =
    username && userId && receiverId && message.trim() && userRole;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const rawUserId = await SecureStore.getItemAsync("userId");
        const token = await SecureStore.getItemAsync("userToken");

        if (!rawUserId || !token) {
          console.warn("Token atau ID tidak ditemukan.");
          router.push("/screens/signin");
          return;
        }

        const cleanedUserId = rawUserId.replace(/"/g, "");
        setUserId(cleanedUserId);

        const response = await axios.get(
          `${BASE_URL}/masyarakat/getbyid/${cleanedUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.nama_masyarakat) {
          setUsername(response.data.nama_masyarakat);
        } else {
          console.warn("Property nama_masyarakat tidak ada di response");
        }

        if (response.data?.role) {
          setUserRole(response.data.role);
        } else {
          console.warn("Property role tidak ada di response");
        }
      } catch (error) {
        console.log("Gagal fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const userId = await SecureStore.getItemAsync("userId");
        if (!userId || !receiverId) {
          console.warn("UserId atau receiverId kosong, skip fetch.");
          return;
        }

        const token = await SecureStore.getItemAsync("userToken");
        const res = await axios.get(
          `${BASE_URL}/chat/history/${userId}/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
      } catch (error) {
        console.log("Gagal ambil riwayat chat:", error);
      }
    };

    fetchChatHistory();
  }, [userId, receiverId]);

  useEffect(() => {
    const handleIncomingMessage = (msg) => {
      console.log("[DEBUG] Received message via socket:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat message", handleIncomingMessage);

    return () => {
      socket.off("chat message", handleIncomingMessage);
    };
  }, []);

  useEffect(() => {
    const fetchReceiverName = async () => {
      if (!receiverId) return;
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const res = await axios.get(
          `${BASE_URL}/dokter/getbyid/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data?.nama_dokter) {
          setReceiverName(res.data.nama_dokter);
        } else {
          console.log("[DEBUG] receiverName not found in response:", res.data);
        }
      } catch (error) {
        console.log("Gagal fetch nama receiver:", error);
      }
    };

    fetchReceiverName();
  }, [receiverId]);

  const sendImage = async (fromCamera = false) => {
    try {
      let result;
      if (fromCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });
      }

      if (!result.canceled && result.assets?.length > 0) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const imgMsg = {
          sender: username,
          senderId: userId,
          receiverId: receiverId,
          image: base64Image,
          type: "image",
          role: userRole,
          waktu: new Date().toISOString(),
        };

        console.log("[DEBUG] Sending image message:", imgMsg);
        socket.emit("chat message", imgMsg);
      } else {
        console.warn("Pengambilan gambar dibatalkan atau tidak valid.");
      }
    } catch (error) {
      console.log("Gagal mengirim gambar:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      socket.emit("joinRoom", userId);
    }
  }, [userId]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("[DEBUG] Socket connected ✅");
    });

    socket.on("connect_error", (err) => {
      console.log("[DEBUG] Socket connection error ❌:", err);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  useEffect(() => {
    const handleErrorMessage = (error) => {
      Alert.alert("Error", error.message);
    };

    socket.on("errorMessage", handleErrorMessage);

    return () => {
      socket.off("errorMessage", handleErrorMessage);
    };
  }, []);

  // Handle consultation ended event
  useEffect(() => {
    const handleConsultationEnded = async (data) => {
      console.log("[DEBUG] Consultation ended:", data);
      setJadwalId(data.jadwalId);

      try {
        const token = await SecureStore.getItemAsync("userToken");
        const res = await axios.get(
          `${BASE_URL}/rating/getbyid/${data.jadwalId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.data.hasRating) {
          Alert.alert(
            "Info",
            "Anda sudah memberikan rating untuk konsultasi ini."
          );
        } else {
          setShowRatingModal(true);
        }
      } catch (error) {
        console.log("Gagal memeriksa status rating:", error);
        Alert.alert("Error", "Gagal memeriksa status rating.");
      }
    };

    socket.on("consultationEnded", handleConsultationEnded);

    return () => {
      socket.off("consultationEnded", handleConsultationEnded);
    };
  }, []);

  const sendMessage = async () => {
    if (!socket.connected) {
      Alert.alert("Error", "Tidak terhubung ke server. Coba lagi nanti.");
      return;
    }

    if (message.trim() && username && userId && receiverId) {
      const msgData = {
        text: message,
        sender: username,
        senderId: userId,
        receiverId: receiverId,
        type: "text",
        role: userRole,
        waktu: new Date().toISOString(),
      };

      socket.emit("chat message", msgData);
      setMessage("");
    } else {
      console.warn("Gagal kirim pesan: Ada data kosong.");
    }
  };

  const submitRating = async () => {
    if (ratingValue < 1 || ratingValue > 5) {
      Alert.alert("Error", "Rating harus antara 1-5.");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("userToken");
      const res = await axios.post(
        `${BASE_URL}/rating/create`,
        {
          jadwal: jadwalId,
          dokter_id: receiverId,
          rating: ratingValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        Alert.alert("Sukses", "Rating berhasil disimpan!");
        setShowRatingModal(false);
        setRatingValue(0);
      }
    } catch (error: any) {
      console.log("Gagal mengirim rating:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal mengirim rating."
      );
    }
  };

  const renderItem = ({ item }) => {
    const isSender = item.senderId === userId;

    return (
      <View
        className={`rounded-[3rem] p-4 px-4 my-1 max-w-[80%] ${
          isSender ? "bg-skyDark self-end" : "bg-[#C3E9FF] self-start"
        }`}
      >
        {item.type === "image" && item.image ? (
          <TouchableOpacity onPress={() => setPreviewImage(item.image)}>
            <Image
              source={{ uri: item.image }}
              className="w-24 h-32 mt-1 rounded-md"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <Text className={`${isSender ? "text-white" : "text-black"}`}>
            {item.text}
          </Text>
        )}
        <Text className="text-xs text-gray-500 mt-1">
          {new Date(item.waktu).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <Background>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row justify-between items-center w-full px-5 bg-skyLight py-5 pt-10">
          <View className="flex-row items-center w-10/12">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text
              className="w-11/12 truncate text-skyDark font-bold text-xl ml-2"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {receiverName ? receiverName : "Loading..."}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Image
              className="h-10 w-12"
              source={require("../../assets/images/logo.png")}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Main Chat Area */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <FlatList
                ref={flatListRef}
                data={[...messages].reverse()}
                keyExtractor={(item) =>
                  item._id?.toString() || Math.random().toString()
                }
                renderItem={renderItem}
                contentContainerStyle={{
                  paddingTop: 10,
                  paddingBottom: 10,
                }}
                keyboardShouldPersistTaps="handled"
                inverted={true}
                className="px-4 flex-1"
              />

              <View className="px-4 bg-skyDark py-4">
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={() => sendImage(false)}>
                    <Ionicons name="image-outline" size={28} color="gray" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => sendImage(true)}
                    className="ml-2"
                  >
                    <Ionicons name="camera-outline" size={28} color="gray" />
                  </TouchableOpacity>
                  <View className="flex-1 ml-2 mr-2">
                    <TextInput
                      className="border border-gray-400 bg-[#C3E9FF] rounded-3xl p-2"
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Tulis pesan..."
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={sendMessage}
                    className="bg-blue-500 px-4 py-2 rounded-lg mr-1"
                  >
                    <Text className="text-white font-semibold">Kirim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {/* Preview Modal */}
        <Modal visible={!!previewImage} transparent={true} animationType="fade">
          <View className="flex-1 bg-black bg-opacity-80 justify-center items-center">
            <TouchableOpacity
              onPress={() => setPreviewImage(null)}
              className="absolute top-10 right-4 z-10"
            >
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                className="w-[90%] h-[60%] rounded-lg"
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>

        {/* Rating Modal */}
        <Modal
          visible={showRatingModal}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
            <View className="bg-white p-6 rounded-lg w-[90%]">
              <Text className="text-lg font-bold mb-4">
                Berikan Rating untuk Konsultasi
              </Text>
              <View className="flex-row justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRatingValue(star)}
                  >
                    <Ionicons
                      name={star <= ratingValue ? "star" : "star-outline"}
                      size={32}
                      color={star <= ratingValue ? "#FFD700" : "#A9A9A9"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setShowRatingModal(false)}
                  className="bg-gray-400 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white">Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitRating}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white">Kirim Rating</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Background>
  );
}
