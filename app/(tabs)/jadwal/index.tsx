import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CancelIcon from "../../../assets/icons/cancel.svg";
import AccIcon from "../../../assets/icons/ctg.svg";
import WaitIcon from "../../../assets/icons/wait.svg";
import DoneIcon from "../../../assets/icons/done.svg";
import RunIcon from "../../../assets/icons/run.svg";
import {
  useJadwalViewModel,
  JadwalItem,
} from "../../../components/viewmodels/useJadwal";

const StatusIcon = ({ status }: { status: string }) => {
  const iconProps = { width: 18, height: 18 };

  switch (status) {
    case "menunggu":
      return <WaitIcon {...iconProps} />;
    case "berlangsung":
      return <RunIcon {...iconProps} />;
    case "diterima":
      return <AccIcon {...iconProps} />;
    case "selesai":
      return <DoneIcon {...iconProps} />;
    case "ditolak":
      return <CancelIcon {...iconProps} />;
    default:
      return null;
  }
};

const DoctorImage = ({ jadwal }: { jadwal: JadwalItem }) => {
  const { getImageUrl } = useJadwalViewModel();
  const [imageError, setImageError] = useState(false);
  const hasFotoProfile = jadwal.dokter_id?.foto_profil_dokter;
  const hasNamaDokter = jadwal.dokter_id?.nama_dokter;

  const hasValidImage = hasFotoProfile && hasNamaDokter && !imageError;

  if (hasValidImage) {
    const imageUrl = getImageUrl(jadwal.dokter_id.foto_profil_dokter);

    return (
      <Image
        source={{ uri: imageUrl }}
        className="h-[70px] w-[70px] rounded-full border border-gray-300"
        resizeMode="cover"
        onError={(error) => {
          setImageError(true);
        }}
        onLoad={() => {
          setImageError(false);
        }}
        onLoadStart={() => {}}
      />
    );
  }

  return (
    <View className="h-[70px] w-[70px] rounded-full border border-gray-300 items-center justify-center bg-gray-200">
      <Ionicons name="person" size={40} color="#0C4A6E" />
    </View>
  );
};

const JadwalCard = ({
  jadwal,
  index,
}: {
  jadwal: JadwalItem;
  index: number;
}) => {
  const {
    getDayName,
    getStatusBackgroundColor,
    getStatusTextColor,
    formatDate,
    getDisplayRating,
    ratingsLoading,
  } = useJadwalViewModel();

  return (
    <View
      key={jadwal._id || index}
      className="bg-white w-full h-40 rounded-3xl flex-col justify-center shadow-md"
    >
      <View className="flex-row">
        <View className="px-4">
          <DoctorImage jadwal={jadwal} />
        </View>
        <View className="w-3/4 justify-center">
          <Text
            className="w-11/12 truncate font-bold text-base text-skyDark pb-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {jadwal.dokter_id?.nama_dokter || "Nama Dokter"}
          </Text>
          <View className="h-[2px] bg-skyDark w-11/12" />
          <View className="flex-row pt-1 items-center">
            <FontAwesome name="star" size={18} color="#025F96" />
            {ratingsLoading && !jadwal.dokter_id.rating_dokter ? (
              <ActivityIndicator
                size="small"
                color="#025F96"
                className="ml-2"
              />
            ) : (
              <Text className="font-bold text-base text-skyDark pl-1">
                {getDisplayRating(jadwal.dokter_id).toFixed(1)}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className="flex-row justify-between px-4">
        <View className="flex-col pt-1  w-3/5">
          <Text className="font-bold text-sm text-skyDark">
            {getDayName(jadwal.tgl_konsul)}, {formatDate(jadwal.tgl_konsul)}
          </Text>
          <Text className="font-bold text-sm text-skyDark">
            Pukul {jadwal.jam_konsul}
          </Text>
          <Text
            className="truncate font-bold text-sm text-skyDark"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {jadwal.keluhan_pasien}
          </Text>
        </View>

        <View className="justify-end w-1/3 flex-col">
          <View
            className={`p-2 flex-row gap-2 rounded-xl items-center justify-between ${getStatusBackgroundColor(
              jadwal.status_konsul
            )}`}
          >
            <StatusIcon status={jadwal.status_konsul} />
            <View className="w-3/4 justify-center items-center">
              <Text
                className="font-bold text-sm capitalize"
                style={{
                  color: getStatusTextColor(jadwal.status_konsul),
                }}
              >
                {jadwal.status_konsul}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const EmptyState = () => (
  <Text className="text-center text-gray-500 text-base">
    Belum ada jadwal konsultasi.
  </Text>
);

const LoadingState = () => (
  <View className="flex h-5/6 justify-center items-center">
    <ActivityIndicator size="large" color="#025F96" />
    <Text className="mt-2 text-skyDark font-semibold">Memuat jadwal . . .</Text>
  </View>
);

const Header = ({ onBackPress }: { onBackPress: () => void }) => (
  <View className="flex flex-row justify-between items-center w-full px-5 py-5 pt-10">
    <View className="flex flex-row items-center">
      <TouchableOpacity onPress={onBackPress}>
        <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
      </TouchableOpacity>
      <Text className="text-skyDark font-bold text-xl pl-2">Jadwal</Text>
    </View>
    <Image className="h-10 w-12" source={images.logo} resizeMode="contain" />
  </View>
);

export default function Jadwal() {
  const insets = useSafeAreaInsets();
  const { jadwalList, loading, refreshing, onRefresh, handleBackPress } =
    useJadwalViewModel();

  return (
    <Background>
      <View>
        <Header onBackPress={handleBackPress} />

        {loading ? (
          <LoadingState />
        ) : (
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: insets.bottom + 120,
            }}
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
            }
          >
            <View className="gap-5 pb-6 w-11/12">
              {jadwalList.length === 0 ? (
                <EmptyState />
              ) : (
                jadwalList.map((jadwal, index) => (
                  <JadwalCard
                    key={jadwal._id || index}
                    jadwal={jadwal}
                    index={index}
                  />
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </Background>
  );
}
