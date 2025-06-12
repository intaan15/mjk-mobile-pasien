import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import { useKeluhanViewModel } from "../../../components/viewmodels/useHome";

export default function Keluhan() {
  const { spesialis, doctorName, doctor_Id, selectedTime, selectedDate } =
    useLocalSearchParams();

  const {
    keluhanText,
    setKeluhanText,
    isLoading,
    handleSubmit,
    handleBack,
  } = useKeluhanViewModel({
    doctor_Id: doctor_Id as string,
    selectedTime: selectedTime as string,
    selectedDate: selectedDate as string,
  });

  return (
    <Background>
      <View className="flex-1">
        <View className="flex flex-row justify-between items-center mb-4 w-full px-5 py-5 pt-10">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={handleBack}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl ml-2">
              {doctorName ? `Keluhan untuk ${doctorName}` : "Keluhan"}
            </Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>

        <View className="items-center">
          <Text className="text-skyDark font-extrabold text-2xl pb-8">
            Silahkan cerita keluhan anda hari ini
          </Text>
          <View className="w-3/4">
            <TextInput
              placeholder="Tulis keluhan anda disini"
              className="bg-transparent border-gray-400 border-2 text-skyDark px-4 py-3 rounded-xl"
              placeholderTextColor="#025F96"
              value={keluhanText}
              onChangeText={setKeluhanText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View className="items-end pt-10">
              <TouchableOpacity
                className={`px-8 rounded-lg text-center ${
                  isLoading ? "bg-gray-400" : "bg-skyDark"
                }`}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text className="p-3 text-slate-100 font-bold text-sm">
                  {isLoading ? "Mengirim..." : "Kirim"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Background>
  );
}