import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  AntDesign,
} from "@expo/vector-icons";
import Modal2 from "./modal2";
import { images } from "../constants/images";
import { useRouter } from "expo-router";
import ImagePickerComponent from "./imagepicker";
import ImageModal from "./modal4";
import { ImageProvider, useImage } from "./imagecontext";

export default function Settings() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    message: "",
    confirmText: "",
    onConfirm: () => { },
  });

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const showDeleteModal = () => {
    setModalConfig({
      message: "Anda yakin akan menghapus akun?",
      confirmText: "Hapus",
      onConfirm: () => console.log("Akun dihapus"),
    });
    toggleModal();
  };

  const showLogoutModal = () => {
    setModalConfig({
      message: "Anda yakin ingin keluar?",
      confirmText: "Keluar",
      onConfirm: () => console.log("Logout sukses"),
    });
    toggleModal();
  };

  const imageContext = useImage();
  const profileImage = imageContext?.profileImage;
  const setImage = imageContext?.setImage;
  const [modalVisible, setModalImageVisible] = useState(false);

  const { openGallery, openCamera } = ImagePickerComponent({
    onImageSelected: setImage,
  });

  return (
    <View
      className="bg-white rounded-xl mx-10 mt-10 p-6 mb-24"
      style={{
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 11,
        elevation: 15,
      }}
    >
      <TouchableOpacity
        className="flex flex-row items-center gap-2 pb-1"
        onPress={() => setModalImageVisible(true)}
      >
        <MaterialCommunityIcons
          name="image-edit-outline"
          size={22}
          color="#025F96"
        />
        <Text className="font-bold text-lg text-skyDark">
          Ganti Foto Profil
        </Text>
      </TouchableOpacity>

      <View className="w-full h-[2px] bg-skyDark" />

      <TouchableOpacity
        className="flex flex-row items-center gap-2 py-1"
        onPress={() => setImage?.(null)}
        disabled={!profileImage}
      >
        <MaterialCommunityIcons name="image-remove" size={22} color="#025F96" />
        <Text className="font-bold text-lg text-skyDark">
          Hapus Foto Profil
        </Text>
      </TouchableOpacity>

      <View className="w-full h-[2px] bg-skyDark" />

      <View className="flex-1 justify-center">
        <TouchableOpacity
          className="flex flex-row items-center gap-2 py-1"
          onPress={showDeleteModal}
        >
          <AntDesign name="delete" size={22} color="red" />
          <Text className="font-bold text-lg text-red-500">Hapus Akun</Text>
        </TouchableOpacity>

        <View className="w-full h-[2px] bg-skyDark" />

        <TouchableOpacity
          className="flex flex-row items-center gap-2 pt-1"
          onPress={showLogoutModal}
        >
          <AntDesign name="logout" size={22} color="red" />
          <Text className="font-bold text-lg text-red-500">Log Out</Text>
        </TouchableOpacity>
        <Modal2
          isOpen={isModalVisible}
          toggleModal={toggleModal}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          onConfirm={modalConfig.onConfirm}
        />
        <ImageModal
          visible={modalVisible}
          onClose={() => setModalImageVisible(false)}
          onPickImage={() => {
            openGallery();
            setModalImageVisible(false);
          }}
          onOpenCamera={() => {
            openCamera();
            setModalImageVisible(false);
          }}
        />
      </View>
    </View>
  );
}
