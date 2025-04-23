import { useState, useEffect } from "react";
import SplashScreen from "./splashscreen";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import axios from "axios";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkToken = async () => {
    const token = await SecureStore.getItemAsync("userToken");
    if (token) {
      try {
        await axios.get("https://mjk-backend-five.vercel.app/api/auth/login_masyarakat", {
          headers: { Authorization: `Bearer ${token}` },
        });
        router.replace("/(tabs)/home");
      } catch (error) {
        await SecureStore.deleteItemAsync("userToken");
        router.replace("/screens/signin");
      }
    } else {
      router.replace("/screens/signin");
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return <>{isLoading ? <SplashScreen /> : null}</>;
}