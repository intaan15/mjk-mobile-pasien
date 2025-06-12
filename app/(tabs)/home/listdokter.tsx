import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import { Ionicons } from "@expo/vector-icons";
import { useDoctorListViewModel } from "../../../components/viewmodels/useHome";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { BASE_URL } from "@env";

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
    handleDoctorPress,
    handleBackPress,
    getTitle,
    getLoadingText,
  } = useDoctorListViewModel();

  const [doctorRatings, setDoctorRatings] = useState<{ [key: string]: number }>({});
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [fetchedDoctorIds, setFetchedDoctorIds] = useState<Set<string>>(new Set()); // Track fetched doctor IDs
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Store error messages

  // Calculate average rating
  const calculateAverageRating = (ratings: Rating[]): number => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
  };

  // Fetch ratings for unfetched doctors
  const fetchDoctorRatings = useCallback(async () => {
    if (doctors.length === 0) return;

    // Filter out doctors whose ratings have already been fetched
    const unfetchedDoctors = doctors.filter((doctor) => !fetchedDoctorIds.has(doctor._id));
    if (unfetchedDoctors.length === 0) return;

    setRatingsLoading(true);
    setErrorMessage(null); // Clear previous errors

    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        console.log("Token not found");
        setErrorMessage("Authentication error. Please log in again.");
        return;
      }

      console.log("Fetching ratings for", unfetchedDoctors.length, "doctors");

      const ratingsPromises = unfetchedDoctors.map(async (doctor) => {
        try {
          console.log(`Fetching rating for doctor: ${doctor._id}`);
          const response = await axios.get(
            `${BASE_URL}/rating/dokter/${doctor._id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(`Rating response for ${doctor._id}:`, response.data);

          if (response.data.success && response.data.data) {
            const averageRating = calculateAverageRating(response.data.data);
            console.log(`Calculated average rating for ${doctor._id}: ${averageRating}`);
            return { doctorId: doctor._id, rating: averageRating };
          }
          return { doctorId: doctor._id, rating: doctor.rating_dokter || 0 };
        } catch (error: any) {
          const errorMsg = error?.response?.data?.message || error.message;
          console.log(`Error fetching rating for doctor ${doctor._id}:`, errorMsg);
          return { doctorId: doctor._id, rating: doctor.rating_dokter || 0 };
        }
      });

      const ratingsResults = await Promise.all(ratingsPromises);
      const ratingsMap: { [key: string]: number } = { ...doctorRatings };

      ratingsResults.forEach(({ doctorId, rating }) => {
        ratingsMap[doctorId] = rating;
      });

      console.log("Final ratings map:", ratingsMap);
      setDoctorRatings(ratingsMap);
      setFetchedDoctorIds((prev) => new Set([...prev, ...unfetchedDoctors.map((d) => d._id)]));
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message;
      console.log("Error fetching doctor ratings:", errorMsg);
      setErrorMessage("Failed to load ratings. Please try again later.");
    } finally {
      setRatingsLoading(false);
    }
  }, [doctors, fetchedDoctorIds, doctorRatings]);

  // Trigger fetch when doctors or loading change
  useEffect(() => {
    if (doctors.length > 0 && !loading) {
      fetchDoctorRatings();
    }
  }, [doctors, loading, fetchDoctorRatings]);

  // Get display rating
  const getDisplayRating = useCallback((doctor: Doctor): number => {
    const apiRating = doctorRatings[doctor._id];
    console.log(`Getting display rating for ${doctor._id}: API=${apiRating}, Original=${doctor.rating_dokter}`);
    return apiRating !== undefined ? apiRating : doctor.rating_dokter || 0;
  }, [doctorRatings]);

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
                        <Text className="font-bold text-base text-skyDark pl-1">
                          {displayRating > 0 ? displayRating.toFixed(1) : "0"}
                        </Text>
                        {ratingsLoading && !fetchedDoctorIds.has(doctor._id) && (
                          <Text className="text-xs text-gray-500 ml-2">Loading...</Text>
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