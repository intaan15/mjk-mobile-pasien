// import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import React, { createContext, useContext, useState } from "react";

export default function ImagePickerComponent({ onImageSelected }) {
  // Fungsi untuk membuka galeri
  const openGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    // Memastikan gambar dipilih dan tidak dibatalkan
    if (!result.canceled && result.assets?.length > 0) {
      console.log("📸 Gambar dari galeri:", result.assets[0]);
      onImageSelected(result.assets[0]); // Mengirim gambar yang dipilih ke parent
    } else {
      console.log(
        "Pemilihan gambar dibatalkan atau tidak ada gambar yang dipilih"
      );
    }
  };

  // Fungsi untuk membuka kamera
  const openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    // Memastikan gambar dipilih dan tidak dibatalkan
    if (!result.canceled && result.assets?.length > 0) {
      console.log("📸 Gambar dari kamera:", result.assets[0]);
      onImageSelected(result.assets[0]); // Mengirim gambar yang dipilih ke parent
    } else {
      console.log(
        "Pengguna membatalkan pengambilan gambar atau tidak ada gambar yang diambil"
      );
    }
  };

  return { openGallery, openCamera };
}

const imagecontext = createContext<{
  profileImage: null;
  setImage: React.Dispatch<React.SetStateAction<null>>;
} | null>(null);

export const ImageProvider = ({ children }) => {
  const [profileImage, setImage] = useState(null);

  return (
    <imagecontext.Provider value={{ profileImage, setImage }}>
      {children}
    </imagecontext.Provider>
  );
};

export const useImage = () => useContext(imagecontext);
