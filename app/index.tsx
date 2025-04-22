import { useState, useEffect } from "react";
import SplashScreen from "./splashscreen";
import { useRouter } from "expo-router";

export default function Index() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
      router.replace("/screens/signin");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return <>{isShowSplash ? <SplashScreen /> : null}</>;
}