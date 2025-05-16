import { View, Text, Image, TouchableOpacity } from "react-native";
import React, {useState, useEffect} from "react";
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
import * as SecureStore from "expo-secure-store";
import axios from "axios";

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
  { name: "Ginjal", Icon: GinjalIcon },
  { name: "Hati", Icon: HatiIcon },
];

interface User {
  nama_masyarakat: string;
}

export default function index() {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await SecureStore.getItemAsync("userId");
      const cleanedUserId = userId?.replace(/"/g, "");
      if (cleanedUserId) {
        const response = await axios.get(
          `https://mjk-backend-production.up.railway.app/api/masyarakat/getbyid/${cleanedUserId}`
        );
        setUserData(response.data);
      }
    } catch (error) {
      router.push("/screens/signin")
    }
  };

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
          </View>
        </View>
      </View>
    </Background>
  );
}
