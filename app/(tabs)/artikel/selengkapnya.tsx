import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import Background from "../../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { images } from "../../../constants/images";
import RenderHTML from "react-native-render-html";
import { useArtikelDetail } from "../../../components/viewmodels/useArtikel";

export default function Selengkapnya() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  // Menggunakan custom hook langsung
  const {
    artikel,
    loading,
    error,
    refreshing,
    onRefresh,
    navigateBack,
    navigateToArtikel,
    formatDate,
    getImageUrl,
  } = useArtikelDetail(id as string);

  if (loading) {
    return (
      <Background>
        <LoadingView />
      </Background>
    );
  }

  if (error || !artikel) {
    return (
      <Background>
        <ErrorView onBackPress={navigateBack} />
      </Background>
    );
  }

  return (
    <Background>
      <View className="flex">
        <HeaderView artikel={artikel} onBackPress={navigateToArtikel} />
        <ContentView
          artikel={artikel}
          formatDate={formatDate}
          getImageUrl={getImageUrl}
          contentWidth={width - 40}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </Background>
  );
}

const LoadingView = () => (
  <View className="flex h-5/6 justify-center items-center">
    <ActivityIndicator size="large" color="#025F96" />
    <Text className="mt-2 text-skyDark font-semibold">
      Memuat artikel . . .
    </Text>
  </View>
);

const ErrorView = ({ onBackPress }: { onBackPress: () => void }) => (
  <View className="flex-1 justify-center items-center">
    <Text className="text-skyDark font-bold text-xl">
      Artikel tidak ditemukan.
    </Text>
    <TouchableOpacity
      onPress={onBackPress}
      className="mt-4 bg-skyDark px-4 py-2 rounded-md"
    >
      <Text className="text-white">Kembali</Text>
    </TouchableOpacity>
  </View>
);

const HeaderView = ({
  artikel,
  onBackPress,
}: {
  artikel: any;
  onBackPress: () => void;
}) => (
  <View className="flex flex-row justify-between items-center mb-4 w-full px-5 pt-8">
    <View className="flex flex-row items-center w-9/12">
      <TouchableOpacity onPress={onBackPress}>
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
    <Image className="h-10 w-12" source={images.logo} resizeMode="contain" />
  </View>
);

const ContentView = ({
  artikel,
  formatDate,
  getImageUrl,
  contentWidth,
  refreshing,
  onRefresh,
}: {
  artikel: any;
  formatDate: (dateString: string) => string;
  getImageUrl: (imagePath: string | null | undefined) => string | null;
  contentWidth: number;
  refreshing: boolean;
  onRefresh: () => void;
}) => (
  <ScrollView
    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={["#025F96"]}
        tintColor="#025F96"
        title="Memuat ulang..."
        titleColor="#025F96"
      />
    }
  >
    <View className="bg-white rounded-2xl shadow-md mt-4 mb-32">
      <View className="p-3">
        <Image
          className="w-full h-48 rounded-xl mb-4"
          source={{
            uri: getImageUrl(artikel.gambar_artikel) ?? "Artikel tidak tersedia",
          }}
          resizeMode="cover"
        />
        <Text className="text-skyDark text-right text-sm font-medium pb-1">
          {formatDate(artikel.createdAt)}
        </Text>
        <Text className="text-skyDark text-center font-bold text-xl pb-4">
          {artikel.nama_artikel}
        </Text>
        <RenderHTML
          contentWidth={contentWidth}
          source={{ html: artikel.detail_artikel }}
          baseStyle={{
            color: "#000000",
            fontSize: 16,
            lineHeight: 24,
            textAlign: "justify",
          }}
          tagsStyles={{
            h1: {
              fontSize: 16,
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
        />
      </View>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({});
