import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import Background from "../../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import TabButton from "../../../components/tabbutton";
import { images } from "../../../constants/images";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@env";
import * as SecureStore from "expo-secure-store";

export default function ArtikelList() {
  const [artikels, setArtikels] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("Kesehatan");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const fetchArtikels = async () => {
        try {
          const token = await SecureStore.getItemAsync("userToken");
          if (!token) {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userId");
            router.replace("/screens/signin");
          }
          const response = await fetch(`${BASE_URL}/artikel/getall`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setArtikels(data);
        } catch (error) {
          console.log("Error fetching artikels:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchArtikels();
    }, [])
  );

  return (
    <Background>
      <View className="flex">
        {/* Header */}
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 pt-8">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl ml-2">Artikel</Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>

        {/* Menu Tab */}
        <View className="flex flex-row mx-6 rounded-xl border-2 border-skyDark overflow-hidden mb-5">
          {["Kesehatan", "Obat"].map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              isActive={selectedTab === tab}
              onPress={() => setSelectedTab(tab)}
            />
          ))}
        </View>

        {/* Artikel List */}
        {loading ? (
          <View className="flex h-3/4 justify-center items-center">
            <ActivityIndicator size="large" color="#025F96" />
            <Text className="mt-2 text-skyDark font-semibold">
              Memuat artikel . . .
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: insets.bottom + 200,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center w-11/12 gap-5">
              {artikels
                .filter((item) => item.kategori_artikel === selectedTab)
                .map((item) => (
                  <View
                    key={item._id}
                    className="bg-white rounded-2xl w-full h-40 shadow-md"
                  >
                    <Image
                      className="rounded-2xl w-full h-24 p-1"
                      source={{
                        uri: `https://mjk-backend-production.up.railway.app/imagesdokter/${item.gambar_artikel}`,
                      }}
                      resizeMode="cover"
                    />
                    <View className="flex-row justify-between w-full">
                      <View className="p-3 w-8/12">
                        <Text className="truncate font-bold text-base text-skyDark"
                        numberOfLines={1}
                        ellipsizeMode="tail">
                          {item.nama_artikel}
                        </Text>
                        <Text className="font-medium text-sm text-skyDark">
                          {new Date(
                            item.createdAt
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="w-1/3 items-center justify-center">
                        <TouchableOpacity
                          className="bg-skyDark items-center justify-center py-2 px-4 rounded-md"
                          onPress={() =>
                            router.push({
                              pathname: "/(tabs)/artikel/selengkapnya",
                              params: {
                                id: item._id,
                              },
                            })
                          }
                        >
                          <Text className="font-medium text-sm text-white">
                            Selengkapnya
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          </ScrollView>
        )}
      </View>
    </Background>
  );
}
