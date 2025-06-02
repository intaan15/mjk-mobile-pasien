import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Background from "../../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { images } from "../../../constants/images";
import { BASE_URL } from "@env";
import * as SecureStore from "expo-secure-store";
import RenderHTML from "react-native-render-html";
import { useWindowDimensions } from "react-native";

export default function Selengkapnya() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [artikel, setArtikel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchArtikelDetail = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) {
          await SecureStore.deleteItemAsync("userToken");
          await SecureStore.deleteItemAsync("userId");
          router.replace("/screens/signin");
        }
        const response = await fetch(`${BASE_URL}/artikel/getbyid/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setArtikel(data);
      } catch (error) {
        console.log("Error fetching artikel detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtikelDetail();
  }, [id]);

  if (!artikel) {
    return (
      <Background>
        <View className="flex-1 justify-center items-center">
          <Text className="text-skyDark font-bold text-xl">
            Artikel tidak ditemukan.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-skyDark px-4 py-2 rounded-md"
          >
            <Text className="text-white">Kembali</Text>
          </TouchableOpacity>
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <View className="flex">
        {/* Header */}
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 pt-8">
          <View className="flex flex-row items-center w-9/12">
            <TouchableOpacity onPress={() => router.replace("/(tabs)/artikel")}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text
              className="truncate text-skyDark font-bold text-xl ml-2"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {artikel.nama_artikel}
            </Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>
        {loading ? (
          <View className="flex h-5/6 justify-center items-center">
            <ActivityIndicator size="large" color="#025F96" />
            <Text className="mt-2 text-skyDark font-semibold">
              Memuat artikel . . .
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-white rounded-2xl shadow-md mt-4 mb-32">
              <View className="p-3">
                <Image
                  className="w-full h-48 rounded-xl mb-4"
                  source={{
                    uri: `https://mjk-backend-production.up.railway.app/imagesdokter/${artikel.gambar_artikel}`,
                  }}
                  resizeMode="cover"
                />
                <Text className="text-skyDark text-right text-sm font-medium pb-1">
                  {new Date(artikel.createdAt).toLocaleDateString()}
                </Text>
                <Text className="text-skyDark text-center font-bold text-xl pb-4">
                  {artikel.nama_artikel}
                </Text>
                {/* <Text className="text-black text-base text-justify leading-relaxed"> */}
                <RenderHTML
                  contentWidth={width - 40}
                  source={{ html: artikel.detail_artikel }}
                  baseStyle={{
                    color: "#000000",
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: "justify",
                  }}
                  tagsStyles={{
                    h1: {
                      fontSize: 24,
                      fontWeight: "bold",
                      marginBottom: 15,
                      color: "#025F96",
                    },
                    p: {
                      marginBottom: 10,
                      lineHeight: 24,
                    },
                    ul: {
                      marginBottom: 10,
                      paddingLeft: 20,
                    },
                    ol: {
                      marginBottom: 10,
                      paddingLeft: 20,
                    },
                    li: {
                      marginBottom: 5,
                      lineHeight: 22,
                    },
                    strong: {
                      fontWeight: "bold",
                    },
                  }}
                  listsPrefixesRenderers={{
                    ul: (
                      _htmlAttribs,
                      _children,
                      convertedCSSStyles,
                      passProps
                    ) => {
                      return (
                        <Text
                          style={
                            passProps.key === "P1"
                              ? styles.bulletP
                              : styles.bullet
                          }
                        >
                          •{" "}
                        </Text>
                      );
                    },
                    ol: (
                      _htmlAttribs,
                      _children,
                      convertedCSSStyles,
                      passProps
                    ) => {
                      return <Text>{passProps.index + 1}. </Text>;
                    },
                  }}
                />
                {/* </Text> */}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  bullet: {
    fontSize: 16,
    color: '#000'
  },
  bulletP: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold'
  }
});