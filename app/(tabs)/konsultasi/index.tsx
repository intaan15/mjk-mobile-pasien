import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from "react-native";
import React, { useEffect, useRef } from "react";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import moment from "moment";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { useChatListViewModel } from "../../../components/viewmodels/useKonsultasi";

interface Chat {
  _id: string;
  nama_dokter?: string;
  foto_profil_dokter?: string;
  lastMessage?: string;
  lastMessageDate: string;
  status: "berlangsung" | "selesai";
  unreadCount?: Record<string, number>;
}

interface GroupedChats {
  berlangsung: Chat[];
  selesai: Chat[];
}

interface ChatListItemProps {
  chat: Chat;
  masyarakatId: string | null;
  onPress: () => void;
  getImageUrl: (url: string | null | undefined) => string | null;
}

interface ProfileImageProps {
  foto_profil?: string;
  getImageUrl: (url: string | null | undefined) => string | null;
}

interface UnreadBadgeProps {
  masyarakatId: string | null;
  unreadCount?: Record<string, number>;
}

export default function HomeScreen() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

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
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
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

  // Group chats by status
  const groupedChats = React.useMemo<GroupedChats>(() => {
    const grouped: GroupedChats = {
      berlangsung: [],
      selesai: []
    };

    (chatList as Chat[]).forEach((chat: Chat) => {
      if (chat.status === "selesai") {
        grouped.selesai.push(chat);
      } else {
        grouped.berlangsung.push(chat);
      }
    });

    // Sort each group by last message date (newest first)
    grouped.berlangsung.sort((a: Chat, b: Chat) => 
      new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
    );
    grouped.selesai.sort((a: Chat, b: Chat) => 
      new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
    );

    return grouped;
  }, [chatList]);

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
            {(chatList as Chat[]).length === 0 ? (
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
                {/* Berlangsung Section */}
                {groupedChats.berlangsung.length > 0 && (
                  <View className="mb-6">
                    <View className="flex flex-row items-center mb-4">
                      <Text className="text-skyDark font-bold text-lg">
                        Berlangsung
                      </Text>
                      <View className="flex-1 h-[2px] bg-skyDark ml-4" />
                    </View>
                    {groupedChats.berlangsung.map((chat: Chat, index: number) => (
                      <ChatListItem
                        key={`berlangsung-${chat._id}-${index}`}
                        chat={chat}
                        masyarakatId={masyarakatId}
                        onPress={() => handleChatPress(chat)}
                        getImageUrl={getImageUrl}
                      />
                    ))}
                  </View>
                )}

                {/* Selesai Section */}
                {groupedChats.selesai.length > 0 && (
                  <View className="mb-6">
                    <View className="flex flex-row items-center mb-4">
                      <Text className="text-skyDark font-bold text-lg">
                        Selesai
                      </Text>
                      <View className="flex-1 h-[2px] bg-skyDark ml-4" />
                    </View>
                    {groupedChats.selesai.map((chat: Chat, index: number) => (
                      <ChatListItem
                        key={`selesai-${chat._id}-${index}`}
                        chat={chat}
                        masyarakatId={masyarakatId}
                        onPress={() => handleChatPress(chat)}
                        getImageUrl={getImageUrl}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Background>
  );
}

const ChatListItem: React.FC<ChatListItemProps> = ({ 
  chat, 
  masyarakatId, 
  onPress, 
  getImageUrl 
}) => {
  return (
    <TouchableOpacity
      className="flex flex-col mb-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex flex-row items-center">
        <ProfileImage
          foto_profil={chat.foto_profil_dokter}
          getImageUrl={getImageUrl}
        />

        <View className="ml-4 flex-1">
          <View className="flex flex-row justify-between items-center">
            <Text
              className="font-semibold text-lg text-skyDark flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {chat.nama_dokter || "Dokter"}
            </Text>
            <Text className="text-gray-500 text-sm ml-2">
              {moment(chat.lastMessageDate).format("DD/MM/YY")}
            </Text>
          </View>

          <View className="flex flex-row justify-between items-center mt-1">
            <Text
              className="text-gray-600 flex-1 mr-2"
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

      <View className="w-full h-[2px] bg-gray-200 mt-3" />
    </TouchableOpacity>
  );
};

const ProfileImage: React.FC<ProfileImageProps> = ({ foto_profil, getImageUrl }) => {
  const [imageLoadError, setImageLoadError] = React.useState<boolean>(false);

  const handleImageError = (error: any) => {
    console.log("Error loading chat profile image:", error.nativeEvent.error);
    setImageLoadError(true);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
  };

  return (
    <View className="h-16 w-16 rounded-full border border-gray-300 bg-gray-100 justify-center items-center">
      {foto_profil && !imageLoadError && getImageUrl(foto_profil) ? (
        <Image
          source={{ uri: getImageUrl(foto_profil) || '' }}
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
const UnreadBadge: React.FC<UnreadBadgeProps> = ({ masyarakatId, unreadCount }) => {
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