import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import DatePickerComponent from "../../../components/picker/datepicker";
import Background from "../../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

interface TimeSlot {
  time: string;
  available: boolean;
}

const scheduleByDay: { [key: string]: TimeSlot[] } = {
  Monday: [
    { time: "09:00", available: true },
    { time: "09:30", available: false },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: false },
    { time: "11:30", available: true },
  ],
  Tuesday: [
    { time: "09:15", available: true },
    { time: "09:45", available: false },
    { time: "10:15", available: true },
    { time: "10:45", available: true },
    { time: "11:15", available: false },
    { time: "11:45", available: true },
  ],
  Wednesday: [
    { time: "09:00", available: true },
    { time: "09:20", available: false },
    { time: "09:40", available: true },
    { time: "10:00", available: true },
    { time: "10:20", available: false },
    { time: "10:40", available: true },
    { time: "11:00", available: true },
    { time: "11:20", available: true },
    { time: "11:40", available: false },
  ],
  Thursday: [
    { time: "09:10", available: true },
    { time: "09:30", available: false },
    { time: "09:50", available: true },
    { time: "10:10", available: true },
    { time: "10:30", available: false },
    { time: "10:50", available: true },
    { time: "11:10", available: true },
    { time: "11:30", available: true },
    { time: "11:50", available: false },
  ],
  Friday: [
    { time: "09:05", available: true },
    { time: "09:25", available: false },
    { time: "09:45", available: true },
    { time: "10:05", available: true },
    { time: "10:25", available: false },
    { time: "10:45", available: true },
    { time: "11:05", available: true },
    { time: "11:25", available: false },
    { time: "11:45", available: true },
  ],
  Saturday: [
    { time: "10:00", available: true },
    { time: "10:30", available: false },
    { time: "11:00", available: true },
    { time: "11:30", available: true },
  ],
  Sunday: [
    { time: "10:15", available: true },
    { time: "10:45", available: false },
    { time: "11:15", available: true },
    { time: "11:45", available: true },
  ],
};

const ScheduleScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(new Date());
    setAvailableTimes(scheduleByDay[dayOfWeek] || []);
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);
    setAvailableTimes(scheduleByDay[dayOfWeek] || []);
    setSelectedTime(null);
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
        <View className="flex-1 flex-col p-2">
          {/* Legend for colors */}
          <View className="flex-row items-center justify-between pb-4 px-4">
            <View className="flex-row items-center gap-1">
              <View className="w-5 h-5 bg-slate-300 rounded-md" />
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

          {/* Date Picker */}
          <DatePickerComponent
            label="Pilih Tanggal"
            onDateChange={handleDateChange}
            // defaultValue={selectedDate}
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
                ))}
              </View>
            </View>
          )}

          {/* Select Schedule Button */}
          <View className="pt-8 w-full items-center">
            <TouchableOpacity
              className="justify-center bg-transparent border-2 border-skyDark py-1 rounded-lg w-1/3 h-10"
              onPress={() => {
                if (selectedTime) {
                  // router.push("/(tabs)/home/konfirmasi");
                  console.log("Selected Time:", selectedTime);
                }
              }}
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
