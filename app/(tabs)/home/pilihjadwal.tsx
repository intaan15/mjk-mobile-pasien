import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import DatePickerComponent from "../../../components/picker/datepicker";
import Background from "../../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { images } from "../../../constants/images";
import { useScheduleViewModel } from "../../../components/viewmodels/useHome";

const ScheduleScreen = () => {
  const {
    selectedDate,
    availableTimes,
    selectedTime,
    loading,
    doctorName,
    handleDateChange,
    handleTimeSelect,
    handleSelectSchedule,
    handleGoBack,
    onRefresh,
    refreshing,
  } = useScheduleViewModel();

  const renderTimeSlot = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      disabled={!item.available}
      onPress={() => handleTimeSelect(item.time)}
      style={{
        padding: 8,
        borderRadius: 8,
        width: "23%",
        borderWidth: 2,
        backgroundColor: item.available
          ? selectedTime === item.time
            ? "#025F96"
            : "transparent"
          : "#D1D5DB",
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
  );

  const renderLegend = () => (
    <View className="flex-row items-center justify-between pb-4 px-4">
      <View className="flex-row items-center gap-1">
        <View className="w-5 h-5 bg-gray-300 rounded-md" />
        <Text className="text-skyDark text-sm font-bold">Tidak Tersedia</Text>
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
  );

  const renderHeader = () => (
    <View className="flex flex-row justify-between items-center mb-4 w-full px-5 py-5 pt-10">
      <View className="flex flex-row items-center">
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
        </TouchableOpacity>
        <Text className="text-skyDark font-bold text-xl ml-2">
          Jadwal Dokter
        </Text>
      </View>
      <Image
        className="h-10 w-12"
        source={images.logo}
        resizeMode="contain"
      />
    </View>
  );

  const renderTimeSlotsSection = () => {
    if (!selectedDate) return null;

    return (
      <View className="pt-1">
        <View className="h-[2px] bg-skyDark w-full" />

        {loading ? (
          <View className="flex justify-center items-center h-full">
            <ActivityIndicator size="large" color="#025F96" />
            <Text className="mt-2 text-skyDark font-semibold">
              Memuat jadwal dokter...
            </Text>
          </View>
        ) : (
          <View className="flex flex-wrap flex-row pt-4 gap-2 justify-between">
            {availableTimes.map((item, index) => renderTimeSlot(item, index))}
          </View>
        )}
      </View>
    );
  };

  const renderSelectButton = () => (
    <View className="pt-8 w-full items-center">
      <TouchableOpacity
        className="justify-center bg-transparent border-2 border-skyDark py-1 rounded-lg w-1/3 h-10"
        onPress={handleSelectSchedule}
      >
        <Text className="text-center text-skyDark text-sm font-semibold">
          Pilih Jadwal
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Background>
      <StatusBar translucent backgroundColor="transparent" />
      
      {renderHeader()}

      <ScrollView
        className="px-6 py-4 mt-[-30px]"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
                                        refreshControl={
                                          <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            colors={["#025F96"]}
                                            tintColor="#025F96"
                                            title="Memuat ulang..."
                                            titleColor="#025F96"
                                          />
                                        }>
      
        {renderLegend()}
        
        <View className="flex-1 flex-col p-2">
          <DatePickerComponent
            label="Pilih Tanggal"
            onDateChange={handleDateChange}
            initialDate={selectedDate}
          />

          {renderTimeSlotsSection()}
          
          {renderSelectButton()}
        </View>
      </ScrollView>
    </Background>
  );
};

export default ScheduleScreen;