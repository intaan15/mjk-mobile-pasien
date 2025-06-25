import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  AppState,
} from "react-native";
import React, { useEffect, useRef } from "react";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import moment from "moment";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { useChatListViewModel } from "../../../components/viewmodels/useKonsultasi";

export default function HomeScreen() {
  const appState = useRef(AppState.currentState);

  const {
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
  } = useChatListViewModel();

  // Handle app state changes to refresh when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log(
          "[DEBUG] 📱 App has come to the foreground, refreshing chat list"
        );
        onRefresh();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [onRefresh]);

  if (loading) {
    return (
      <Background>
        <View className="flex h-full justify-center items-center">
          <ActivityIndicator size="large" color="#025F96" />
          <Text className="mt-2 text-skyDark font-semibold">
            Memuat daftar chat...
          </Text>
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <View className="flex-1">
        {/* Header */}
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 pt-10">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={handleBack}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl ml-2">
              Konsultasi
            </Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>

        {/* Chat List */}
        <View className="flex-1">
          <ScrollView
            className="px-6 py-4"
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#025F96"]} // Android
                tintColor="#025F96" // iOS
                title="Memuat ulang..." // iOS
                titleColor="#025F96" // iOS
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {chatList.length === 0 ? (
              <View className="flex items-center justify-center py-20">
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color="#9CA3AF"
                />
                <Text className="text-gray-500 text-lg mt-4 text-center">
                  Belum ada riwayat konsultasi
                </Text>
              </View>
            ) : (
              <>
                {chatList.map((chat, index) => (
                  <ChatListItem
                    key={`${chat._id}-${index}`}
                    chat={chat}
                    masyarakatId={masyarakatId}
                    onPress={() => handleChatPress(chat)}
                    getImageUrl={getImageUrl}
                  />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Background>
  );
}

const ChatListItem = ({ chat, masyarakatId, onPress, getImageUrl }) => {
  return (
    <TouchableOpacity
      className="flex flex-col mb-2"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex flex-row justify-between">
        <Text className="p-2 rounded-xl font-bold self-end">
          Konsultasi Dengan
        </Text>
        <View className="flex-row items-center">
          <Text
            className={`p-2 rounded-xl self-end ${
              chat.status === "selesai" ? "bg-lime-200" : "bg-yellow-200"
            }`}
          >
            {chat.status === "selesai" ? "Selesai" : "Berlangsung"}
          </Text>
          {/* Show online indicator if available */}
          {chat.isOnline && (
            <View className="w-3 h-3 bg-green-500 rounded-full ml-2" />
          )}
        </View>
      </View>

      <View className="flex flex-row items-center">
        <ProfileImage
          foto_profil={chat.foto_profil_dokter}
          getImageUrl={getImageUrl}
        />

        <View className="ml-4 flex-1">
          <View className="flex flex-row justify-between">
            <Text
              className="w-10/12 truncate font-semibold text-lg text-skyDark"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {chat.nama_dokter || "Dokter"}
            </Text>
            <Text className="text-gray-500 text-sm">
              {moment(chat.lastMessageDate).format("DD/MM/YY")}
            </Text>
          </View>

          <View className="flex flex-row justify-between items-center">
            <Text
              className="truncate text-justify text-gray-700 mt-1 flex-1 mr-2"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {chat.lastMessage || "Belum ada pesan"}
            </Text>
            <UnreadBadge
              masyarakatId={masyarakatId}
              unreadCount={chat.unreadCount}
            />
          </View>
        </View>
      </View>

      <View className="w-full h-[2px] bg-skyDark my-2" />
    </TouchableOpacity>
  );
};

const ProfileImage = ({ foto_profil, getImageUrl }) => {
  const [imageLoadError, setImageLoadError] = React.useState(false);

  const handleImageError = (error) => {
    console.log("Error loading chat profile image:", error.nativeEvent.error);
    setImageLoadError(true);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
  };

  return (
    <View className="h-16 w-16 rounded-full border border-gray-300 bg-gray-100 justify-center items-center">
      {foto_profil && !imageLoadError ? (
        <Image
          source={{ uri: getImageUrl(foto_profil) }}
          className="h-full w-full rounded-full"
          resizeMode="cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <View className="h-16 w-16 rounded-full border border-gray-300 items-center justify-center bg-gray-200">
          <Ionicons name="person" size={32} color="#0C4A6E" />
        </View>
      )}
    </View>
  );
};

// Separate component for unread message badge
const UnreadBadge = ({ masyarakatId, unreadCount }) => {
  if (!masyarakatId || !unreadCount || unreadCount[masyarakatId] <= 0) {
    return null;
  }

  return (
    <View className="bg-red-500 rounded-full px-2 py-1 min-w-[20px] items-center justify-center">
      <Text className="text-white text-xs font-bold">
        {unreadCount[masyarakatId] > 99 ? "99+" : unreadCount[masyarakatId]}
      </Text>
    </View>
  );
};
