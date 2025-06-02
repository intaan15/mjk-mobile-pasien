import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import TabButton from "../../../components/tabbutton";
import DatePickerComponent from "../../../components/picker/datepicker";
import moment from "moment";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@env";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

interface User {
  nama_dokter: string;
}

export default function HomeScreen() {
  const [userData, setUserData] = useState<User | null>(null);
  // const [dokterId, setDokterId] = useState<string | null>(null);
  const [masyarakatId, setMasyarakatId] = useState<string | null>(null);

  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("Berlangsung");
  // const [selectedDate, setSelectedDate] = useState(moment().format("DD/MM/YY"));
  const [chatList, setChatList] = useState<any[]>([]);
  const fallbackImageUrl = "/assets/images/foto.jpeg"; // Atau URL default lainnya

  // const filteredChats = chatList.filter(
  //   (chat) => moment(chat.lastMessageDate).format("DD/MM/YY") === selectedDate
  // );
  const fetchChatList = async (userId: string, token: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/chatlist/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("RAW chatlist data:", response.data); // ⬅️ Tambahkan ini

      const enrichedChatList = response.data.map((chat: any) => {
        return {
          ...chat,
          nama_dokter: chat.participant?.nama || "Dokter",
          foto_dokter: chat.participant?.foto_profil || fallbackImageUrl,
          id_dokter: chat.participant?._id || "",
        };
      });

      setChatList(enrichedChatList);
    } catch (error) {
      console.log("Gagal ambil chat list", error);
    }
  };

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
      setMasyarakatId(cleanedId); // Ganti dari dokterId
      fetchChatList(cleanedId, token);

      // setUserData(response.data);
      // setDokterId(cleanedId); // <- simpan ke state agar bisa dipakai nanti
      // fetchChatList(cleanedId, token); // <- Panggil ambil chatlist
    } catch (error) {
      console.log("Gagal ambil data user", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  return (
    <Background>
      <View className="flex-1">
        {/* Header */}
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 pt-8">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
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
        <View className="flex flex-row mx-6 rounded-xl border-2 border-skyDark overflow-hidden">
          {["Berlangsung", "Selesai"].map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              isActive={selectedTab === tab}
              onPress={() => setSelectedTab(tab)}
            />
          ))}
        </View>

        {/* Chat List */}
        <View className="flex-1">
          <ScrollView
            className="px-6 py-4"
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            {/* {filteredChats.map((chat) => ( */}
            {chatList.map((chat) => (
              <TouchableOpacity
                key={chat._id}
                className="flex flex-col"
                onPress={() => {
                  const currentUserId = masyarakatId;
                  const otherParticipant = chat.participant;

                  if (currentUserId && otherParticipant?._id) {
                    router.push({
                      pathname: "/chat/[id]",
                      params: {
                        senderId: currentUserId,
                        receiverId: otherParticipant._id,
                      },
                    });
                  } else {
                    console.warn("Data participant tidak lengkap:", chat);
                  }
                }}
              >
                <View className="flex flex-row items-center">
                  <Image
                    source={{ uri: chat.foto_masyarakat || fallbackImageUrl }}
                    className="h-16 w-16 rounded-full border border-gray-300"
                    resizeMode="cover"
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
                    <View className="flex flex-row justify-between">
                      <Text
                        className="truncate text-justify text-gray-700 mt-1"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {chat.lastMessage || "Belum ada pesan"}
                      </Text>
                      <Text>
                        {masyarakatId &&
                          chat.unreadCount &&
                          chat.unreadCount[masyarakatId] > 0 && (
                            <View className="bg-red-500 rounded-full px-2 py-1 ml-2">
                              <Text className="text-white text-xs">
                                {chat.unreadCount[masyarakatId]}
                              </Text>
                            </View>
                          )}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="w-full h-[2px] bg-skyDark my-2" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flexDirection: "row",
  },
  text: {
    color: "#025F96",
  },
});
