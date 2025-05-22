import { StatusBar, View, ImageBackground } from "react-native";
import React from "react";
import { images } from "../constants/images";

export default function Background({ children }) {
  return (
    <ImageBackground
      source={images.bg}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="dark-content"
      />
      <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)" }}>
        {children}
      </View>
    </ImageBackground>
  );
}
