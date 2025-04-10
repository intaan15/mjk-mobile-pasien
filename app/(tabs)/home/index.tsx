import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Background from '../../components/background';
import { images } from '../../constants/images';
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


export default function index() {
  const router = useRouter();
  return (
    <Background>
      <View className='flex-1'>
        <View className="relative pt-12 bg-skyLight rounded-b-[50px] py-28">
          <View className="absolute inset-0 flex items-center justify-between flex-row px-12">
            <Text className="text-skyDark text-2xl font-bold">
              Selamat datang, {"\n"}king!
            </Text>
            <Image
              className="h-10 w-12"
              source={images.logo}
              resizeMode="contain"
              />
          </View>
        </View>
        <View className='flex-1'>
          <View className='items-center pt-9'>
            <Text className='text-xl text-skyDark font-extrabold pb-6'>Mojokerto Sehat</Text>
            <View className=' w-10/12'>
              <Text className='text-lg text-skyDark font-bold pb-1'>Poli Klinik</Text>
              <View className="h-[2px] bg-skyDark w-full"/>
            </View>
            <View className='w-11/12 h-auto'>
              <View className='flex-row flex-wrap justify-center gap-x-3 gap-y-3'>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20 bg-red-500' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <UmumIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Umum</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20 bg-blue-500' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <MataIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Mata</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <AnakIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Anak</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <GigiIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Gigi</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20 bg-purple-500' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <THTIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>THT</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <JantungIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Jantung</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <KandunganIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Kandungan</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <BedahIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Bedah</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <SyarafIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Syaraf</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <DarahIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Darah</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <ParuIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Paru</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <FisioIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Fisioterapi</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <GinjalIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Ginjal</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex-col justify-center items-center w-20 h-20' onPress={() => router.push('/(tabs)/home/keluhan')}>
                  <HatiIcon width={50} height={50} />
                  <Text className='text-skyDark font-bold'>Hati</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Background>
  )
}