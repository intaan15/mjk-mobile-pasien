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
import AccIcon from "../../../assets/icons/ctg.svg";

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
          router.replace("/screens/signin");
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
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        slideAnim.setValue(-300);
        fadeAnim.setValue(0);
        const pool = artikelPool.current;
        currentIndex.current = (currentIndex.current + 2) % pool.length;
        const nextArticles = pool.slice(
          currentIndex.current,
          currentIndex.current + 2
        );

        if (nextArticles.length < 2) {
          const remaining = 2 - nextArticles.length;
          setDisplayedArticles([...nextArticles, ...pool.slice(0, remaining)]);
        } else {
          setDisplayedArticles(nextArticles);
        }

        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    };

    const interval = setInterval(changeArticles, 5000);

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
          console.log("Gagal fetch jadwal:", err.message);
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
              <View className=" w-10/12 pt-9">
                <Text className="text-lg text-skyDark font-bold pb-1">
                  Jadwal Anda
                </Text>
                <View className="h-[2px] bg-skyDark w-full mb-5" />
              </View>
              <View className="gap-5 pb-3 w-10/12">
                {jadwalList
                  .filter((jadwal) => {
                    const today = new Date();
                    const jadwalDate = new Date(jadwal.tgl_konsul);
                    today.setHours(0, 0, 0, 0);
                    jadwalDate.setHours(0, 0, 0, 0);

                    return (
                      jadwal.status_konsul === "diterima" && jadwalDate >= today
                    );
                  })
                  .sort(
                    (a, b) =>
                      new Date(a.tgl_konsul).getTime() -
                      new Date(b.tgl_konsul).getTime()
                  )
                  .slice(0, 1)
                  .map((jadwal, index) => (
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
                                uri: `https://mjk-backend-production.up.railway.app/uploads/${jadwal.dokter_id.foto_profil_dokter}`,
                              }}
                              className="h-20 w-20 rounded-full border border-gray-300"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="h-20 w-20 rounded-full border border-gray-300 items-center justify-center bg-gray-200">
                              <Ionicons
                                name="person"
                                size={40}
                                color="#0C4A6E"
                              />
                            </View>
                          )}
                        </View>
                        <View className="w-3/4">
                          <Text className="font-bold text-base text-skyDark pb-1">
                            {jadwal.dokter_id?.nama_dokter || "Nama Dokter"}
                          </Text>
                          <View className="h-[2px] bg-skyDark w-11/12" />
                          <View className="flex-row pt-1 items-center">
                            <FontAwesome
                              name="star"
                              size={20}
                              color="#025F96"
                            />
                            <Text className="font-bold text-base text-skyDark pl-1">
                              {jadwal.dokter_id?.rating_dokter}
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
                          <View className="p-2 flex-row gap-2 rounded-xl items-center justify-between bg-green-600">
                            <AccIcon width={18} height={18} />
                            <View className="w-3/4 justify-center items-center">
                              <Text className="text-white font-bold text-sm capitalize">
                                {jadwal.status_konsul}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                {jadwalList.filter((jadwal) => {
                  const today = new Date();
                  const jadwalDate = new Date(jadwal.tgl_konsul);
                  today.setHours(0, 0, 0, 0);
                  jadwalDate.setHours(0, 0, 0, 0);

                  return (
                    jadwal.status_konsul === "diterima" && jadwalDate >= today
                  );
                }).length === 0 && (
                  <Text className="text-center text-gray-500 text-base italic">
                    Tidak ada jadwal konsultasi.
                  </Text>
                )}
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
