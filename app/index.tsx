import { useState, useEffect } from "react";
import SplashScreen from "./splashscreen";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import axios from "axios";
import { BASE_URL } from "@env";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleStartup = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      const userId = await SecureStore.getItemAsync("userId");

      if (token && userId) {
        // try {
        //   // await axios.get(
        //   //   `${BASE_URL}/auth/login_masyarakat`,
        //   //   {
        //   //     headers: { Authorization: `Bearer ${token}` },
        //   //   }
        //   // );
        //   // delay 2 detik, lalu masuk home
          setTimeout(() => {
            setIsLoading(false);
            router.replace("/(tabs)/home");
          }, 2000); // iki 2000 gae 2 detik kalik
        // } catch (error) {
        //   // await SecureStore.deleteItemAsync("userToken");
        //   // await SecureStore.deleteItemAsync("userId");
        //   console.log("error : ",error)
        //   // setTimeout(() => {
        //   //   setIsLoading(false);
        //   //   router.replace("/(tabs)/home");
        //   //   // router.replace("/screens/signin");
        //   // }, 2000);
        // }
      } else {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        // alert("Token anda habis silahkan login ulang")
        // console.log("token : ",token)
        // console.log("error kabeh")
        setTimeout(() => {
          setIsLoading(false);
          // router.replace("/(tabs)/home");
          router.replace("/screens/signin");
        }, 2000);
      }
    };

    handleStartup();
  }, []);

  return <>{isLoading ? <SplashScreen /> : null}</>;
}
