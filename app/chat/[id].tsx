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
  const isSendReady =
    username && userId && receiverId && message.trim() && userRole;
  const flatListRef = useRef<FlatList>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [selectedJadwal, setSelectedJadwal] = useState<string | null>(null);
  const [selectedDokter, setSelectedDokter] = useState<string | null>(null);
  const rawParams = useLocalSearchParams();
  const [hasRated, setHasRated] = useState({});

  const getJakartaTime = () => {
    const now = new Date();
    const jakartaOffset = 7 * 60 * 60 * 1000;
    const jakartaTime = new Date(now.getTime() + jakartaOffset);
    return jakartaTime.toISOString();
  };

  const formatDateToIndonesian = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const compareDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const compareToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const compareYesterday = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (compareDate.getTime() === compareToday.getTime()) {
      return "Hari ini";
    } else if (compareDate.getTime() === compareYesterday.getTime()) {
      return "Kemarin";
    } else {
      const bulanIndonesia = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const tanggal = date.getDate();
      const bulan = bulanIndonesia[date.getMonth()];
      const tahun = date.getFullYear();

      return `${tanggal} ${bulan} ${tahun}`;
    }
  };

  const groupMessagesByDate = (messages: any[]) => {
    const grouped: { [key: string]: any[] } = {};

    messages.forEach((message) => {
      const dateKey = message.waktu
        ? message.waktu.split("T")[0]
        : new Date().toISOString().split("T")[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });

    const groupedArray = Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((date) => ({
        date,
        messages: grouped[date].sort(
          (a, b) => new Date(a.waktu).getTime() - new Date(b.waktu).getTime()
        ),
      }));

    return groupedArray;
  };

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
          console.warn("Property nama_dokter tidak ada di response");
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
    const handleIncomingMessage = (msg: any) => {
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
        const asset = result.assets[0];
        let base64Image;

        const imageFormat =
          asset.uri?.split(".").pop()?.toLowerCase() || "jpeg";
        const mimeType = imageFormat === "png" ? "image/png" : "image/jpeg";

        if (asset.base64) {
          base64Image = `data:${mimeType};base64,${asset.base64}`;
        } else {
          console.log("❌ Base64 data tidak tersedia");
          alert("Gagal mengambil data gambar");
          return;
        }

        const imgMsg = {
          sender: username,
          senderId: userId,
          receiverId: receiverId,
          image: base64Image,
          type: "image",
          role: userRole,
          waktu: getJakartaTime(),
        };

        console.log("[DEBUG] 📷 Sending image message:", {
          type: imgMsg.type,
          hasImage: !!imgMsg.image,
          imageLength: imgMsg.image?.length || 0,
          imageHeader: imgMsg.image?.substring(0, 30) + "...",
          sender: imgMsg.sender,
          senderId: imgMsg.senderId,
          receiverId: imgMsg.receiverId,
        });

        socket.emit("chat message", imgMsg);

        console.log("✅ Image message sent successfully");
      } else {
        console.warn("⚠️ Pengambilan gambar dibatalkan atau tidak valid.");
      }
    } catch (error) {
      console.log("❌ Gagal mengirim gambar:", error);
      alert("Gagal mengirim gambar: " + (error as Error).message);
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
    const handleErrorMessage = (error: any) => {
      alert(error.message);
    };

    socket.on("errorMessage", handleErrorMessage);

    return () => {
      socket.off("errorMessage", handleErrorMessage);
    };
  }, []);

  const sendMessage = async () => {
    console.log("[DEBUG] 📝 Tombol Kirim ditekan");
    console.log("- username:", username);
    console.log("- userId:", userId);
    console.log("- receiverId:", receiverId);
    console.log("- userRole:", userRole);
    console.log("- message:", message);

    if (message.trim() && username && userId && receiverId) {
      const msgData = {
        text: message,
        sender: username,
        senderId: userId,
        receiverId: receiverId,
        type: "text",
        role: userRole,
        waktu: getJakartaTime(),
      };

      console.log("[DEBUG] 📤 Sending text message:", msgData);
      console.log("[DEBUG] 🔌 Socket connected:", socket.connected);

      socket.emit("chat message", msgData);
      setMessage("");
    } else {
      console.warn("⚠️ Gagal kirim pesan: Ada data kosong.");
    }
  };

  useEffect(() => {
    const jadwal_id = Array.isArray(rawParams.jadwal_id)
      ? rawParams.jadwal_id[0]
      : rawParams.jadwal_id;

    const status = Array.isArray(rawParams.status)
      ? rawParams.status[0]
      : rawParams.status;

    const dokter_id = Array.isArray(rawParams.dokter_id)
      ? rawParams.dokter_id[0]
      : rawParams.dokter_id;

    const checkRating = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");

        if (jadwal_id && status === "selesai") {
          const response = await axios.get(
            `${BASE_URL}/rating/getbyid/${jadwal_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const hasRated =
            response.data?.data?.hasRating ||
            response.data?.hasRating ||
            response.data?.rating ||
            (response.data?.data?.rating && response.data.data.rating > 0) ||
            false;

          if (!hasRated) {
            setShowRatingModal(true);
            setSelectedJadwal(jadwal_id);
            setSelectedDokter(dokter_id);
          } else {
            console.log("[DEBUG] ❌ Modal not shown - User already rated");
          }
        } else {
          console.log("[DEBUG] ❌ CONDITIONS NOT MET:", {
            hasJadwalId: !!jadwal_id,
            statusMatch: status === "selesai",
            currentStatus: status,
          });
        }
      } catch (error: any) {
        console.log(
          "[DEBUG] ❌ API Error:",
          error.response?.status,
          error.response?.data || error.message
        );

        console.log(
          "[DEBUG] 🚨 API ERROR - Consider showing modal anyway for debug"
        );
      }
    };

    const timer = setTimeout(() => {
      checkRating();
    }, 1000);

    return () => clearTimeout(timer);
  }, [rawParams]);

  const handleSubmitRating = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");

      console.log("[DEBUG] Submitting rating:", {
        jadwal: selectedJadwal,
        dokter_id: selectedDokter,
        rating: ratingValue,
      });

      await axios.post(
        `${BASE_URL}/rating/create`,
        {
          jadwal: selectedJadwal,
          dokter_id: selectedDokter,
          rating: ratingValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Terima kasih atas rating Anda!");
      setShowRatingModal(false);
      setRatingValue(0);
    } catch (error: any) {
      console.log("Gagal kirim rating:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Gagal menyimpan rating");
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === "dateSeparator") {
      return (
        <View className="items-center mb-5">
          <View className="bg-gray-200 px-5 py-1 rounded-full">
            <Text className="text-gray-600 text-sm font-medium">
              {formatDateToIndonesian(item.date)}
            </Text>
          </View>
        </View>
      );
    }

    const isSender = item.senderId === userId;
    return (
      <View className={`mb-2 ${isSender ? "items-end" : "items-start"}`}>
        <View
          className={`rounded-2xl p-3 px-4 max-w-[80%] ${
            isSender ? "bg-skyDark rounded-br-sm" : "bg-skyLight rounded-bl-sm"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 1,
          }}
        >
          {item.type === "image" && item.image ? (
            <TouchableOpacity
              onPress={() => {
                console.log(
                  "[DEBUG] 🖼️ Opening preview for image:",
                  item.image
                );
                setPreviewImage(item.image);
              }}
              onLongPress={() => {
                console.log("[DEBUG] 📋 Image URI:", item.image);
              }}
            >
              <Image
                source={{
                  uri: item.image.startsWith("data:")
                    ? item.image
                    : item.image.startsWith("http")
                    ? item.image
                    : `${BASE_URL2}${item.image}`,
                }}
                className="w-36 h-44 rounded-lg"
                resizeMode="cover"
                onError={(error) => {
                  console.log(
                    "❌ Error loading image:",
                    error.nativeEvent.error
                  );
                  console.log("❌ Failed image URI:", item.image);
                }}
                onLoad={() => {
                  console.log("✅ Image loaded successfully");
                }}
              />
            </TouchableOpacity>
          ) : item.type === "text" && item.text ? (
            <Text
              className={`text-sm leading-5 ${
                isSender ? "text-white" : "text-gray-800"
              }`}
            >
              {item.text}
            </Text>
          ) : (
            <View>
              <Text
                className={`${
                  isSender ? "text-white" : "text-gray-600"
                } italic text-sm`}
              >
                [Pesan tidak dapat ditampilkan]
              </Text>
              <Text
                className={`${
                  isSender ? "text-white" : "text-gray-500"
                } text-xs opacity-50 mt-1`}
              >
                Type: {item.type} | HasText: {!!item.text} | HasImage:{" "}
                {!!item.image}
              </Text>
            </View>
          )}
        </View>
        {item.waktu && (
          <Text className="text-xs text-gray-400 mt-1 px-2">
            {item.waktu.substring(11, 16)}
          </Text>
        )}
      </View>
    );
  };

  const prepareMessagesWithDates = () => {
    const groupedMessages = groupMessagesByDate(messages);
    const flatData: any[] = [];

    groupedMessages.reverse().forEach((group, groupIndex) => {
      group.messages
        .slice()
        .reverse()
        .forEach((message, index) => {
          flatData.push({
            ...message,
            id: `message-${group.date}-${index}-${
              message.waktu || getJakartaTime()
            }`,
          });
        });

      flatData.push({
        type: "dateSeparator",
        date: group.date,
        id: `date-${group.date}`,
      });
    });

    return flatData;
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
          <Image
            className="h-10 w-12"
            source={require("../../assets/images/logo.png")}
            resizeMode="contain"
          />
        </View>

        {/* Area Chat Utama dengan KeyboardAvoidingView yang benar */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          {/* Pesan Chat */}
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={prepareMessagesWithDates()}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{
                padding: 16,
                flexGrow: 1,
                justifyContent: "flex-end",
              }}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              inverted={true}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
              removeClippedSubviews={false}
              initialNumToRender={20}
              maxToRenderPerBatch={10}
              windowSize={10}
              getItemLayout={null}
            />
          </View>

          {/* Input Chat */}
          <View className="px-4 bg-skyDark py-4" style={{ minHeight: 70 }}>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => sendImage(false)}>
                <Ionicons name="image-outline" size={28} color="#C3E9FF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => sendImage(true)}
                className="ml-2"
              >
                <Ionicons name="camera-outline" size={28} color="#C3E9FF" />
              </TouchableOpacity>
              <View className="flex-1 ml-2 mr-2">
                <TextInput
                  className="border border-skyLight bg-skyLight rounded-3xl p-2 min-h-[40px]"
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Tulis pesan..."
                  placeholderTextColor="#9CA3AF"
                  multiline={true}
                  numberOfLines={Platform.OS === "ios" ? undefined : 1}
                  textAlignVertical={Platform.OS === "android" ? "top" : "top"}
                  maxHeight={100}
                  scrollEnabled={true}
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#1F2937",
                    paddingTop: Platform.OS === "ios" ? 8 : 10,
                    paddingBottom: Platform.OS === "ios" ? 8 : 10,
                    paddingHorizontal: 12,
                    minHeight: 40,
                    maxHeight: 100,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={sendMessage}
                className="bg-skyLight p-3 rounded-full mr-1"
              >
                <Ionicons name="send" size={20} color="#025F96" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Modal Preview */}
        <Modal
          visible={!!previewImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewImage(null)}
        >
          <View className="flex-1 bg-black/80 justify-center items-center">
            <TouchableOpacity
              onPress={() => {
                console.log("[DEBUG] 🚫 Closing preview modal");
                setPreviewImage(null);
              }}
              className="absolute top-10 right-4 z-10 bg-black/50 rounded-full p-2"
            >
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPreviewImage(null)}
              className="absolute inset-0 bg-transparent"
              activeOpacity={1}
            />

            {previewImage && (
              <View className="justify-center items-center w-full h-full p-4">
                <Image
                  source={{
                    uri: previewImage.startsWith("data:")
                      ? previewImage
                      : previewImage.startsWith("http")
                      ? previewImage
                      : `${BASE_URL2}${previewImage}`,
                  }}
                  style={{
                    width: "90%",
                    height: "60%",
                  }}
                  resizeMode="contain"
                  onLoadStart={() => {
                    console.log("🔄 Image loading started...");
                  }}
                  onLoad={(event) => {
                    console.log("✅ Preview image loaded successfully");
                    console.log("Image dimensions:", event.nativeEvent.source);
                  }}
                  onError={(error) => {
                    console.log(
                      "❌ Preview image error:",
                      error.nativeEvent.error
                    );
                    console.log("❌ Preview URI:", previewImage);
                    console.log(
                      "❌ Full URI being used:",
                      previewImage.startsWith("data:")
                        ? "Base64 Image"
                        : previewImage.startsWith("http")
                        ? previewImage
                        : `${BASE_URL2}${previewImage}`
                    );
                  }}
                />
              </View>
            )}
          </View>
        </Modal>

        {/* Modal Rating */}
        <Modal visible={showRatingModal} transparent animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-Warm rounded-2xl p-5 w-4/5">
              <Text className="text-lg text-skyDark font-bold mb-2.5">
                Beri Rating Konsultasi
              </Text>
              <View className="flex-row justify-center my-2.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRatingValue(star)}
                  >
                    <MaterialIcons
                      name={star <= ratingValue ? "star" : "star-border"}
                      size={32}
                      color={star <= ratingValue ? "#facc15" : "#9ca3af"}
                      style={{ marginHorizontal: 5 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                className="bg-skyDark p-2.5 rounded-[10px] items-center mt-2.5"
                onPress={handleSubmitRating}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Kirim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Background>
  );
}
