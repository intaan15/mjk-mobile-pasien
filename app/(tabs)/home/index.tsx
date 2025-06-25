import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import UmumIcon from "../../../assets/icons/umum.svg";
import JantungIcon from "../../../assets/icons/jantung.svg";
import ParuIcon from "../../../assets/icons/paru.svg";
import MataIcon from "../../../assets/icons/mata.svg";
import AnakIcon from "../../../assets/icons/anak.svg";
import GigiIcon from "../../../assets/icons/gigi.svg";
import THTIcon from "../../../assets/icons/tht.svg";
import KandunganIcon from "../../../assets/icons/kandungan.svg";
import BedahIcon from "../../../assets/icons/bedah.svg";
import SyarafIcon from "../../../assets/icons/syaraf.svg";
import DarahIcon from "../../../assets/icons/darah.svg";
import FisioIcon from "../../../assets/icons/fisio.svg";
import GinjalIcon from "../../../assets/icons/ginjal.svg";
import HatiIcon from "../../../assets/icons/hati.svg";
import KulitIcon from "../../../assets/icons/kulit.svg";
import LambungIcon from "../../../assets/icons/lambung.svg";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AccIcon from "../../../assets/icons/ctg.svg";
import { useHomeViewModel } from "../../../components/viewmodels/useHome";
import { BASE_URL2 } from "@env";

const spesialisList = [
  { name: "Umum", Icon: UmumIcon },
  { name: "Mata", Icon: MataIcon },
  { name: "Anak", Icon: AnakIcon },
  { name: "Gigi", Icon: GigiIcon },
  { name: "THT", Icon: THTIcon },
  { name: "Jantung", Icon: JantungIcon },
  { name: "Kandungan", Icon: KandunganIcon },
  { name: "Bedah", Icon: BedahIcon },
  { name: "Syaraf", Icon: SyarafIcon },
  { name: "Darah", Icon: DarahIcon },
  { name: "Paru", Icon: ParuIcon },
  { name: "Fisioterapi", Icon: FisioIcon },
  { name: "Lambung", Icon: LambungIcon },
  { name: "Ginjal", Icon: GinjalIcon },
  { name: "Hati", Icon: HatiIcon },
  { name: "Kulit", Icon: KulitIcon },
];

const MarqueeText = ({ text, style }: { text: string; style?: any }) => {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.63;

  const translateX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (textWidth <= containerWidth) {
      translateX.setValue(0);
      return;
    }

    const duration = (textWidth + containerWidth) * 30;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -textWidth,
          duration,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(translateX, {
          toValue: containerWidth,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    translateX.setValue(containerWidth);
    animation.start();

    return () => animation.stop();
  }, [textWidth, containerWidth]);

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <Animated.View
        style={{
          transform: [{ translateX }],
          flexDirection: "row",
        }}
      >
        <Text
          style={[style, { flexShrink: 0 }]}
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          numberOfLines={1}
          ellipsizeMode="clip"
        >
          {text + "     "}
        </Text>
        {textWidth > containerWidth && (
          <Text
            style={[style, { flexShrink: 0 }]}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {text + "     "}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

export default function HomeView() {
  const {
    userData,
    displayedArticles,
    upcomingJadwal,
    hasNoAppointments,
    slideAnim,
    fadeAnim,
    getDayName,
    navigateToDoctor,
    navigateToArticle,
    getImageUrl,
    refreshing,
    onRefresh,
    getDisplayRating,
  } = useHomeViewModel();

  return (
    <Background>
      <View className="flex-1">
        {/* Header */}
        <View className="relative pt-12 bg-skyLight rounded-b-[50px] py-28">
          <View className="absolute inset-0 flex items-center justify-between flex-row px-12">
            <View className="flex-1 mr-4">
              <Text className="text-skyDark text-2xl font-bold pb-1">
                Selamat datang,
              </Text>
              <MarqueeText
                text={userData?.nama_masyarakat || "Loading..."}
                style={{ fontSize: 20, color: "#025F96", fontWeight: "bold" }}
              />
            </View>
            <Image
              className="h-10 w-12"
              source={images.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
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
          <View className="flex-1">
            <View className="items-center pt-9">
              <Text className="text-xl text-skyDark font-extrabold pb-6">
                Mojokerto Sehat
              </Text>

              {/* Poli Klinik Section */}
              <View className="w-10/12">
                <Text className="text-lg text-skyDark font-bold pb-1">
                  Poli Klinik
                </Text>
                <View className="h-[2px] bg-skyDark w-full" />
              </View>
              <View className="w-11/12 h-auto">
                <View className="flex-row flex-wrap justify-center gap-x-3 gap-y-3">
                  {spesialisList.map(({ name, Icon }, index) => (
                    <TouchableOpacity
                      key={index}
                      className="flex-col justify-center items-center w-20 h-20"
                      onPress={() => navigateToDoctor(name)}
                    >
                      <Icon width={50} height={50} />
                      <Text className="text-skyDark font-bold">{name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Jadwal Section */}
              <View className="w-10/12 pt-9">
                <Text className="text-lg text-skyDark font-bold pb-1">
                  Jadwal Anda
                </Text>
                <View className="h-[2px] bg-skyDark w-full mb-5" />
              </View>
              <View className="gap-5 pb-3 w-10/12">
                {upcomingJadwal.map((jadwal, index) => (
                  <View
                    key={index}
                    className="bg-white w-full h-40 rounded-3xl flex-col justify-center shadow-md"
                  >
                    <View className="flex-row">
                      <View className="px-4">
                        {jadwal.dokter_id?.foto_profil_dokter &&
                        jadwal.dokter_id?.nama_dokter ? (
                          <Image
                            source={{
                              uri: `${BASE_URL2}${jadwal.dokter_id.foto_profil_dokter}`,
                            }}
                            className="h-20 w-20 rounded-full border border-gray-300"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-20 w-20 rounded-full border border-gray-300 items-center justify-center bg-gray-200">
                            <Ionicons name="person" size={40} color="#0C4A6E" />
                          </View>
                        )}
                      </View>
                      <View className="w-3/4">
                        <Text
                          className="w-11/12 font-bold text-base text-skyDark pb-1 truncate"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {jadwal.dokter_id?.nama_dokter || "Nama Dokter"}
                        </Text>
                        <View className="h-[2px] bg-skyDark w-11/12" />
                        <View className="flex-row pt-1 items-center">
                          <FontAwesome name="star" size={20} color="#025F96" />
                          <Text className="font-bold text-base text-skyDark pl-1">
                            {getDisplayRating(jadwal.dokter_id)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row justify-between px-4">
                      <View className="flex-col pt-1">
                        <Text className="font-bold text-sm text-skyDark">
                          {getDayName(jadwal.tgl_konsul)},
                        </Text>
                        <Text className="font-bold text-sm text-skyDark">
                          {new Date(jadwal.tgl_konsul).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </Text>
                        <Text className="font-bold text-sm text-skyDark">
                          Pukul {jadwal.jam_konsul}
                        </Text>
                      </View>
                      <View className="justify-center w-1/3 flex-col">
                        <View className="p-2 flex-row gap-2 rounded-xl items-center justify-between bg-green-200">
                          <AccIcon width={18} height={18} />
                          <View className="w-3/4 justify-center items-center">
                            <Text
                              className="font-bold text-sm capitalize"
                              style={{ color: "#009113" }}
                            >
                              {jadwal.status_konsul}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
                {hasNoAppointments && (
                  <Text className="text-center text-gray-500 text-base italic">
                    Tidak ada jadwal konsultasi.
                  </Text>
                )}
              </View>

              {/* Informasi Kesehatan Section */}
              <View className="w-10/12 pt-7">
                <Text className="text-lg text-skyDark font-bold pb-1">
                  Informasi Kesehatan
                </Text>
                <View className="h-[2px] bg-skyDark w-full mb-5" />
              </View>
              <View className="w-10/12 items-center">
                {displayedArticles.length > 0 ? (
                  <Animated.View
                    style={{
                      transform: [{ translateX: slideAnim }],
                      opacity: fadeAnim,
                      width: "100%",
                    }}
                  >
                    {displayedArticles.map((item) => (
                      <View
                        key={item._id}
                        className="bg-white rounded-2xl w-full h-40 shadow-md mb-5"
                      >
                        <Image
                          className="rounded-2xl w-full h-24 p-1"
                          source={{
                            uri: getImageUrl(item.gambar_artikel) ?? "",
                          }}
                          resizeMode="cover"
                        />
                        <View className="flex-row justify-between p-3">
                          <View className="flex-1">
                            <Text
                              className="truncate w-11/12 font-bold text-base text-skyDark"
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {item.nama_artikel}
                            </Text>
                            <Text className="font-medium text-sm text-skyDark">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                          <TouchableOpacity
                            className="bg-skyDark items-center justify-center py-2 px-4 rounded-md h-10 self-center"
                            onPress={() => navigateToArticle(item._id)}
                          >
                            <Text className="font-medium text-sm text-white">
                              Selengkapnya
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </Animated.View>
                ) : (
                  <Text className="text-center text-gray-500 text-base italic">
                    Memuat artikel . . .
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flexDirection: "row",
  },
});