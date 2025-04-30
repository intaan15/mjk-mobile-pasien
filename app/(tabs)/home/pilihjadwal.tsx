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

// Definisikan tipe untuk waktu slot
interface TimeSlot {
  time: string;
  available: boolean;
}

const ScheduleScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]); // Mendeklarasikan tipe dengan benar
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const router = useRouter();
  const { doctorName, spesialis } = useLocalSearchParams();
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Fetch data dokter berdasarkan nama
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await axios.get(
          `https://mjk-backend-production.up.railway.app/api/dokter/getbyname/${doctorName}`
        );
        const doctor = response.data;

        if (doctor) {
          setDoctorId(doctor._id); // Set doctor ID
        }
      } catch (error: any) {
        console.error("Error fetching doctor data:", error.response ? error.response.data : error.message);
        Alert.alert("Terjadi Kesalahan", "Gagal mengambil data dokter.");
      }
    };

    fetchDoctorData();
  }, [doctorName]);

  // Fetch jadwal dokter berdasarkan tanggal yang dipilih
  useEffect(() => {
    if (doctorId) {
      const fetchSchedule = async () => {
        try {
          const selectedDateUTC = new Date(selectedDate).toISOString();
          const response = await axios.get(
            `https://mjk-backend-production.up.railway.app/api/dokter/jadwal/${doctorId}`
          );
          
          const filteredTimes = response.data.filter((schedule: any) => {
            const scheduleDate = new Date(schedule.tanggal);
            return scheduleDate.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0];
          });

          // Jika ada jadwal untuk tanggal yang dipilih, buat slot waktu per 30 menit
          const timeSlots = filteredTimes.flatMap((item: any) => {
            const startTime = item.jam_mulai.split(":").map(Number);
            const endTime = item.jam_selesai.split(":").map(Number);
            let timeSlots = [];

            let currentTime = new Date(selectedDate);
            currentTime.setHours(startTime[0]);
            currentTime.setMinutes(startTime[1]);

            const endDate = new Date(selectedDate);
            endDate.setHours(endTime[0]);
            endDate.setMinutes(endTime[1]);

            // Generate slots of 30 minutes
            while (currentTime < endDate) {
              const hour = String(currentTime.getHours()).padStart(2, "0");  // padStart untuk jam
              const minute = String(currentTime.getMinutes()).padStart(2, "0");  // padStart untuk menit
              timeSlots.push({
                time: `${hour}:${minute}`,
                available: true,
              });

              currentTime.setMinutes(currentTime.getMinutes() + 30);
            }

            // Jika slot terakhir lebih kecil dari 30 menit, buat slot terakhir berdasarkan waktu selesai
            if (currentTime < endDate) {
              const hour = String(endDate.getHours()).padStart(2, "0");
              const minute = String(endDate.getMinutes()).padStart(2, "0");
              timeSlots.push({
                time: `${hour}:${minute}`,
                available: true,
              });
            }

            return timeSlots;
          });

          setAvailableTimes(timeSlots); // Set available times with 30-minute intervals
        } catch (error) {
          console.error("Error fetching schedule:", error);
        }
      };

      fetchSchedule();
    }
  }, [selectedDate, doctorId]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePilihJadwal = async () => {
    if (!selectedTime) return;

    try {
      const tanggalFormatted = selectedDate.toISOString(); // Convert to UTC
      const [hour, minute] = selectedTime.split(":").map(Number);
      const jamSelesaiDate = new Date(selectedDate);
      jamSelesaiDate.setHours(hour);
      jamSelesaiDate.setMinutes(minute + 30);
      const jam_selesai = `${String(jamSelesaiDate.getHours()).padStart(2, "0")}:${String(jamSelesaiDate.getMinutes()).padStart(2, "0")}`;

      const response = await axios.post("https://mjk-backend-production.up.railway.app/api/jadwal/create", {
        dokter_id: doctorId,
        masyarakat_id: "userId", // Pastikan userId tersedia dari state atau context aplikasi
        verifikasi_id: "verificationId", // Pastikan verifikasiId juga tersedia
        tgl_konsul: tanggalFormatted,
        keluhan_pasien: "Keluhan pasien", // Ganti sesuai input dari pasien
        jumlah_konsul: 1, // Ganti sesuai jumlah konsul yang diinginkan
      });

      // Setelah jadwal berhasil disimpan, nonaktifkan slot yang telah dipilih
      const updatedAvailableTimes = availableTimes.map((item) => {
        if (item.time === selectedTime) {
          return { ...item, available: false }; // Set slot yang dipilih menjadi tidak tersedia
        }
        return item;
      });

      setAvailableTimes(updatedAvailableTimes); // Update availableTimes dengan yang baru

      Alert.alert("Sukses", "Jadwal berhasil disimpan!");
      router.push({
        pathname: "/(tabs)/home/keluhan",
        params: { doctorName, spesialis, selectedTime },
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert("Gagal", error?.response?.data?.message || "Terjadi kesalahan.");
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
      <ScrollView className="px-6 py-4 mt-[-30px]" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* DatePicker */}
        <View className="flex-1 flex-col p-2">
          <DatePickerComponent label="Pilih Tanggal" onDateChange={handleDateChange} />

          {/* Time Slots */}
          {selectedDate && (
            <View className="pt-1">
              <View className="h-[2px] bg-skyDark w-full" />
              <View className="flex flex-wrap flex-row pt-4 gap-2 justify-between">
                {availableTimes.length > 0 ? (
                  availableTimes.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      disabled={!item.available}
                      onPress={() => setSelectedTime(item.time)}
                      className={`p-2 rounded-md w-[23%] text-center border-2
                        ${
                          !item.available
                            ? "bg-slate-300 border-slate-300"
                            : selectedTime === item.time
                            ? "bg-skyDark border-skyDark"
                            : "bg-transparent border-skyDark"
                        }`}
                    >
                      <Text
                        className={`text-lg text-center
                          ${
                            !item.available
                              ? "text-white"
                              : selectedTime === item.time
                              ? "text-white"
                              : "text-skyDark"
                          }`}
                      >
                        {item.time}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-center text-skyDark">Tidak ada jadwal untuk tanggal ini</Text>
                )}
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
