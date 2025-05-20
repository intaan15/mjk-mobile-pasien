import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import DatePickerComponent from "../../../components/picker/datepicker";
import Background from "../../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

interface TimeSlot {
  _id: string;
  time: string;
  available: boolean;
}

const ScheduleScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const router = useRouter();
  const { doctorName, spesialis } = useLocalSearchParams();
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) {
          console.log("Token tidak ditemukan");
          return;
        }
        const response = await axios.get(
          `https://mjk-backend-production.up.railway.app/api/dokter/getbyname/${doctorName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const doctor = response.data;

        if (doctor) {
          setDoctorId(doctor._id);
        }
      } catch (error: any) {
        console.error(
          "Error fetching doctor data:",
          error.response ? error.response.data : error.message
        );
        Alert.alert("Terjadi Kesalahan", "Gagal mengambil data dokter.");
      }
    };

    fetchDoctorData();
  }, [doctorName]);

  useEffect(() => {
    if (doctorId) {
      const fetchSchedule = async () => {
        try {
          const token = await SecureStore.getItemAsync("userToken");
          if (!token) {
            console.log("Token tidak ditemukan");
            return;
          }
          const response = await axios.get(`https://mjk-backend-production.up.railway.app/api/dokter/getbyid/${doctorId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          const jadwal = response.data.jadwal;

          const selectedDateOnly = new Date(selectedDate)
            .toISOString()
            .split("T")[0];
          const matchingJadwal = jadwal.find((item: any) => {
            const jadwalDateOnly = new Date(item.tanggal)
              .toISOString()
              .split("T")[0];
            return jadwalDateOnly === selectedDateOnly;
          });

          if (matchingJadwal) {
            setAvailableTimes(matchingJadwal.jam);
          } else {
            setAvailableTimes([]);
          }
        } catch (error: any) {
          if (error.response) {
            console.error("API Error:", error.response.data);
            console.error("Status code:", error.response.status);
          } else {
            console.error("Error message:", error.message);
          }
        }
      };

      fetchSchedule();
    }
  }, [selectedDate, doctorId]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const calculateEndTime = (date: Date, time: string): string => {
    const [hour, minute] = time.split(":").map(Number);
    const endDate = new Date(date);
    endDate.setHours(hour);
    endDate.setMinutes(minute);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const hours = String(endDate.getHours()).padStart(2, "0");
    const minutes = String(endDate.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const handlePilihJadwal = async () => {
    if (!selectedTime) {
      Alert.alert("Peringatan", "Pilih waktu terlebih dahulu.");
      return;
    }

    try {
      const userId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("userToken");
      if (!userId) throw new Error("ID masyarakat tidak ditemukan");
      if (!token) {
        console.log("Token tidak ditemukan");
        return;
      }
      const selectedJam = availableTimes.find(
        (item) => item.time === selectedTime
      );
      if (!selectedJam) {
        Alert.alert("Peringatan", "Waktu tidak tersedia.");
        return;
      }

      const jamId = selectedJam._id;

      const tanggalFormatted = selectedDate.toISOString();
      const jam_selesai = calculateEndTime(selectedDate, selectedTime);

      await axios.patch(
        `https://mjk-backend-production.up.railway.app/api/dokter/jadwal/${doctorId}/jam/${jamId}`,
        {
          tanggal: tanggalFormatted,
          jam_mulai: selectedTime,
          jam_selesai,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push({
        pathname: "/(tabs)/home/keluhan",
        params: {
          doctorName,
          spesialis,
          selectedTime,
          selectedDate: tanggalFormatted,
        },
      });
    } catch (error: any) {
      if (error.response) {
        console.error("API Error:", error.response.data);
        Alert.alert(
          "Gagal",
          error.response.data.message || "Terjadi kesalahan."
        );
      } else {
        console.error("Error message:", error.message);
        Alert.alert("Gagal", "Terjadi kesalahan jaringan.");
      }
    }
  };

  return (
    <Background>
      <StatusBar translucent backgroundColor="transparent" />
      {/* Header */}
      <View className="flex flex-row justify-between items-center mb-4 w-full px-5 py-5 pt-10">
        <View className="flex flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
          </TouchableOpacity>
          <Text className="text-skyDark font-bold text-xl ml-2">
            Jadwal Dokter
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="px-6 py-4 mt-[-30px]"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Tanggal */}
        <View className="flex-row items-center justify-between pb-4 px-4">
          <View className="flex-row items-center gap-1">
            <View className="w-5 h-5 bg-gray-300 rounded-md" />
            <Text className="text-skyDark text-sm font-bold">
              Tidak Tersedia
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-5 h-5 bg-skyDark rounded-md" />
            <Text className="text-skyDark text-sm font-bold">Pilihanmu</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-5 h-5 rounded-md border-2 border-skyDark bg-transparent" />
            <Text className="text-skyDark text-sm font-bold">Tersedia</Text>
          </View>
        </View>
        {/* DatePicker */}
        <View className="flex-1 flex-col p-2">
          <DatePickerComponent
            label="Pilih Tanggal"
            onDateChange={handleDateChange}
          />

          {/* Time Slots */}
          {selectedDate && (
            <View className="pt-1">
              <View className="h-[2px] bg-skyDark w-full" />
              <View className="flex flex-wrap flex-row pt-4 gap-2 justify-between">
                {availableTimes.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    disabled={!item.available}
                    onPress={() => setSelectedTime(item.time)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      width: "23%",
                      borderWidth: 2,
                      backgroundColor: item.available
                        ? selectedTime === item.time
                          ? "#025F96" // SkyDark if selected
                          : "transparent"
                        : "#D1D5DB", // Gray if unavailable
                      borderColor: item.available
                        ? selectedTime === item.time
                          ? "#025F96"
                          : "#025F96"
                        : "#D1D5DB",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: item.available
                          ? selectedTime === item.time
                            ? "white"
                            : "#025F96"
                          : "white",
                        textAlign: "center",
                      }}
                    >
                      {item.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Select Schedule Button */}
          <View className="pt-8 w-full items-center">
            <TouchableOpacity
              className="justify-center bg-transparent border-2 border-skyDark py-1 rounded-lg w-1/3 h-10"
              onPress={handlePilihJadwal}
            >
              <Text className="text-center text-skyDark text-sm font-semibold">
                Pilih Jadwal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Background>
  );
};

export default ScheduleScreen;
