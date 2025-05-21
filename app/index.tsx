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

      if (token) {
        try {
          await axios.get(
            `${BASE_URL}/auth/login_masyarakat`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // delay 2 detik, lalu masuk home
          setTimeout(() => {
            setIsLoading(true);
            router.replace("/(tabs)/home");
          }, 0);
        } catch (error) {
          // await SecureStore.deleteItemAsync("userToken");
          setTimeout(() => {
            setIsLoading(true);
            router.replace("/(tabs)/home");
            // router.replace("/screens/signin");
          }, 0);
        }
      } else {
        await SecureStore.deleteItemAsync("userToken");
        setTimeout(() => {
          setIsLoading(true);
          router.replace("/(tabs)/home");
          // router.replace("/screens/signin");
        }, 0);
      }
    };

    handleStartup();
  }, []);

  // return <>{isLoading ? <SplashScreen /> : null}</>;
}
