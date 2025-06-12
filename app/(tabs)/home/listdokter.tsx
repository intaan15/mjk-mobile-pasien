import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import { Ionicons } from "@expo/vector-icons";
import { useDoctorListViewModel } from "../../../components/viewmodels/useHome";

type Doctor = {
  _id: string;
  nama_dokter: string;
  spesialis_dokter: string;
  rating_dokter: number;
  foto_profil_dokter?: string;
};

type Rating = {
  _id: string;
  jadwal: string;
  masyarakat_id: {
    _id: string;
    nama: string;
  };
  dokter_id: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export default function DoctorListView() {
  const insets = useSafeAreaInsets();
  const {
    doctors,
    loading,
    doctorRatings,
    ratingsLoading,
    fetchedDoctorIds,
    errorMessage,
    handleDoctorPress,
    handleBackPress,
    getTitle,
    getLoadingText,
    getDisplayRating,
  } = useDoctorListViewModel();

  return (
    <Background>
      <View>
        <View className="flex flex-row justify-between items-center w-full px-5 py-5 pt-10">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={handleBackPress}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl pl-2">
              {getTitle()}
            </Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>

        {errorMessage && (
          <View className="bg-red-100 p-3 mx-5 rounded-lg">
            <Text className="text-red-700">{errorMessage}</Text>
          </View>
        )}

        {loading ? (
          <View className="flex h-5/6 justify-center items-center">
            <ActivityIndicator size="large" color="#025F96" />
            <Text className="mt-2 text-skyDark font-semibold">
              {getLoadingText()}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: insets.bottom + 120,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-5 pb-6 w-4/5">
              {doctors.map((doctor, index) => {
                const displayRating = getDisplayRating(doctor);

                return (
                  <TouchableOpacity
                    key={doctor._id || index}
                    className="bg-white w-full h-24 rounded-3xl flex-row items-center justify-center shadow-md"
                    onPress={() => handleDoctorPress(doctor)}
                  >
                    <View className="px-4">
                      {doctor.foto_profil_dokter ? (
                        <Image
                          source={{
                            uri: `https://mjk-backend-production.up.railway.app/uploads/${doctor.foto_profil_dokter}`,
                          }}
                          className="h-16 w-16 rounded-full border border-gray-300"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="h-16 w-16 rounded-full border border-gray-300 items-center justify-center bg-gray-200">
                          <Ionicons name="person" size={32} color="#0C4A6E" />
                        </View>
                      )}
                    </View>
                    <View className="w-3/4">
                      <Text
                        className="w-11/12 truncate font-bold text-base text-skyDark pb-1"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {doctor.nama_dokter}
                      </Text>
                      <View className="h-[2px] bg-skyDark w-11/12" />
                      <View className="flex-row pt-1 items-center">
                        <FontAwesome name="star" size={20} color="#025F96" />
                        {ratingsLoading && !fetchedDoctorIds.has(doctor._id) ? (
                          <ActivityIndicator
                            size="small"
                            color="#025F96"
                            className="ml-2"
                          />
                        ) : (
                          <Text className="font-bold text-base text-skyDark pl-1">
                            {getDisplayRating(doctor).toFixed(1)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>
    </Background>
  );
}
