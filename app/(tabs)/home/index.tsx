import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
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
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@env";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import CancelIcon from "../../../assets/icons/cancel.svg";
import AccIcon from "../../../assets/icons/ctg.svg";
import WaitIcon from "../../../assets/icons/wait.svg";

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

const getDayName = (dateString: string) => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const date = new Date(dateString);
  return days[date.getDay()];
};

interface User {
  nama_masyarakat: string;
}

export default function index() {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [artikels, setArtikels] = useState<any[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<any[]>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const artikelPool = useRef<any[]>([]);
  const currentIndex = useRef(0);
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const userId = await SecureStore.getItemAsync("userId");
          const token = await SecureStore.getItemAsync("userToken");
          if (!token && !userId) return;
          const cleanedUserId = userId?.replace(/"/g, "");
          if (cleanedUserId) {
            const response = await axios.get(
              `${BASE_URL}/masyarakat/getbyid/${cleanedUserId}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setUserData(response.data);
          }
        } catch (error) {
          router.push("/screens/signin");
        }
      };
      fetchUserData();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchArtikels = async () => {
        try {
          const token = await SecureStore.getItemAsync("userToken");
          if (!token) return;
          const response = await fetch(`${BASE_URL}/artikel/getall`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setArtikels(data);
          const filtered = data.filter(
            (article) =>
              article.kategori_artikel === "Kesehatan" ||
              article.kategori_artikel === "Obat"
          );
          artikelPool.current = filtered;
          setDisplayedArticles(filtered.slice(0, 2));
        } catch (error) {
          console.log("Error fetching artikels:", error);
        }
      };
      fetchArtikels();
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (artikelPool.current.length === 0) return;

    const changeArticles = () => {
      // Slide out to right and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300, // Slide to right
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0, // Fade out
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset position off-screen left before sliding in
        slideAnim.setValue(-300);
        fadeAnim.setValue(0);

        // Update artikel after animation completes
        const pool = artikelPool.current;
        currentIndex.current = (currentIndex.current + 2) % pool.length;
        const nextArticles = pool.slice(
          currentIndex.current,
          currentIndex.current + 2
        );

        // If not enough articles, get from beginning
        if (nextArticles.length < 2) {
          const remaining = 2 - nextArticles.length;
          setDisplayedArticles([...nextArticles, ...pool.slice(0, remaining)]);
        } else {
          setDisplayedArticles(nextArticles);
        }

        // Slide in from left and fade in
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0, // Slide to normal position
            duration: 700,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(fadeAnim, {
            toValue: 1, // Fade in
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    };

    const interval = setInterval(changeArticles, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [artikels]);

  useFocusEffect(
    useCallback(() => {
      const fetchJadwal = async () => {
        try {
          const userId = await SecureStore.getItemAsync("userId");
          const token = await SecureStore.getItemAsync("userToken");
          if (!userId && !token) return;

          const res = await axios.get(`${BASE_URL}/jadwal/getall`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const filtered = res.data.filter((j: any) => {
            return j.masyarakat_id && j.masyarakat_id._id === userId;
          });

          setJadwalList(filtered);
        } catch (err: any) {
          console.error("Gagal fetch jadwal:", err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchJadwal();
    }, [])
  );
  return (
    <Background>
      <View className="flex-1">
        <View className="relative pt-12 bg-skyLight rounded-b-[50px] py-28">
          <View className="absolute inset-0 flex items-center justify-between flex-row px-12">
            <Text className="text-skyDark text-2xl font-bold">
              Selamat datang, {"\n"}
              {userData ? userData.nama_masyarakat : "Loading..."}
            </Text>
            <Image
              className="h-10 w-12"
              source={images.logo}
              resizeMode="contain"
            />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View className="flex-1">
            <View className="items-center pt-9">
              <Text className="text-xl text-skyDark font-extrabold pb-6">
                Mojokerto Sehat
              </Text>
              <View className=" w-10/12">
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
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/home/listdokter",
                          params: { spesialis: name },
                        })
                      }
                    >
                      <Icon width={50} height={50} />
                      <Text className="text-skyDark font-bold">{name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className=" w-10/12 pt-7">
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
                          className="rounded-t-2xl w-full h-24"
                          source={{
                            uri: `https://mjk-backend-production.up.railway.app/imagesdokter/${item.gambar_artikel}`,
                          }}
                          resizeMode="cover"
                        />
                        <View className="flex-row justify-between p-3">
                          <View className="flex-1">
                            <Text className="font-bold text-base text-skyDark">
                              {item.nama_artikel}
                            </Text>
                            <Text className="font-medium text-sm text-skyDark">
                              {new Date(
                                item.tgl_terbit_artikel
                              ).toLocaleDateString()}
                            </Text>
                          </View>
                          <TouchableOpacity
                            className="bg-skyDark items-center justify-center py-2 px-4 rounded-md h-10 self-center"
                            onPress={() =>
                              router.push({
                                pathname: "/(tabs)/artikel/selengkapnya",
                                params: { id: item._id },
                              })
                            }
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
                  <Text className="text-skyDark">
                    Tidak ada artikel tersedia
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
