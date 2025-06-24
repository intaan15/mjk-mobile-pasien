import { useState, useEffect, useCallback, useRef } from "react";
import { Animated, Easing, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@env";

export interface User {
  nama_masyarakat: string;
}

export interface Article {
  _id: string;
  nama_artikel: string;
  kategori_artikel: string;
  gambar_artikel: string;
  createdAt: string;
}

export interface Jadwal {
  _id: string;
  masyarakat_id: { _id: string };
  dokter_id: {
    nama_dokter: string;
    foto_profil_dokter: string;
    rating_dokter: number;
  };
  tgl_konsul: string;
  jam_konsul: string;
  status_konsul: string;
}

export type Doctor = {
  _id: string;
  nama_dokter: string;
  spesialis_dokter: string;
  rating_dokter: number;
  foto_profil_dokter?: string;
};

export type Rating = {
  _id: string;
  jadwal: string;
  masyarakat_id: {
    _id: string;
    nama: string;
  };
  dokter_id: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export const useHomeViewModel = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [artikels, setArtikels] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const artikelPool = useRef<Article[]>([]);
  const currentIndex = useRef(0);

  const getDayName = (dateString: string): string => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

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

        if (response.data.role !== "masyarakat") {
          await SecureStore.deleteItemAsync("userToken");
          await SecureStore.deleteItemAsync("userId");
          router.replace("/screens/signin");
          return;
        }

        setUserData(response.data);
      }
    } catch (error) {
      router.replace("/screens/signin");
    }
  };

  

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
        (article: Article) =>
          article.kategori_artikel === "Kesehatan" ||
          article.kategori_artikel === "Obat"
      );

      artikelPool.current = filtered;
      setDisplayedArticles(filtered.slice(0, 2));
    } catch (error) {
      console.log("Error fetching artikels:", error);
    }
  };
  const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    const baseUrlWithoutApi = BASE_URL.replace("/api", "");

    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return `${baseUrlWithoutApi}/${cleanPath}`;
  };
  const fetchJadwal = async () => {
    try {
      const userId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("userToken");
      if (!userId || !token) return;

      const res = await axios.get(`${BASE_URL}/jadwal/getall`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const filtered = res.data.filter((j: Jadwal) => {
        return j.masyarakat_id && j.masyarakat_id._id === userId;
      });

      setJadwalList(filtered);
    } catch (err: any) {
      console.log("Gagal fetch jadwal:", err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const navigateToDoctor = (spesialis: string) => {
    router.push({
      pathname: "/(tabs)/home/listdokter",
      params: { spesialis },
    });
  };

  const navigateToArticle = (id: string) => {
    router.push({
      pathname: "/(tabs)/artikel/selengkapnya",
      params: { id },
    });
  };

  const getUpcomingJadwal = () => {
    return jadwalList
      .filter((jadwal) => {
        if (jadwal.status_konsul !== "diterima") return false;

        const [hour, minute] = jadwal.jam_konsul.split(":").map(Number);
        const jadwalDateTime = new Date(jadwal.tgl_konsul);
        jadwalDateTime.setHours(hour, minute, 0, 0);

        return jadwalDateTime >= new Date();
      })
      .sort(
        (a, b) =>
          new Date(a.tgl_konsul).getTime() - new Date(b.tgl_konsul).getTime()
      )
      .slice(0, 1);
  };

  const hasNoUpcomingAppointments = () => {
    return (
      jadwalList.filter((jadwal) => {
        const today = new Date();
        const jadwalDate = new Date(jadwal.tgl_konsul);
        today.setHours(0, 0, 0, 0);
        jadwalDate.setHours(0, 0, 0, 0);

        return jadwal.status_konsul === "diterima" && jadwalDate >= today;
      }).length === 0
    );
  };

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await fetchArtikels();
    await fetchJadwal();
    await fetchUserData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      fetchArtikels();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      fetchJadwal();
    }, [])
  );

  useEffect(() => {
    if (artikelPool.current.length === 0) return;
    const interval = setInterval(changeArticles, 5000);
    return () => clearInterval(interval);
  }, [artikels]);

  return {
    userData,
    displayedArticles,
    loading,
    slideAnim,
    fadeAnim,
    upcomingJadwal: getUpcomingJadwal(),
    hasNoAppointments: hasNoUpcomingAppointments(),
    getDayName,
    navigateToDoctor,
    navigateToArticle,
    getImageUrl,
    onRefresh,
    refreshing,
  };
};

export const useDoctorListViewModel = () => {
  const router = useRouter();
  const { spesialis } = useLocalSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorRatings, setDoctorRatings] = useState<{ [key: string]: number }>(
    {}
  );
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [fetchedDoctorIds, setFetchedDoctorIds] = useState<Set<string>>(
    new Set()
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate average rating
  const calculateAverageRating = (ratings: Rating[]): number => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  // Fetch ratings for unfetched doctors
  const fetchDoctorRatings = useCallback(async () => {
    if (doctors.length === 0) return;

    // Filter out doctors whose ratings have already been fetched
    const unfetchedDoctors = doctors.filter(
      (doctor) => !fetchedDoctorIds.has(doctor._id)
    );
    if (unfetchedDoctors.length === 0) return;

    setRatingsLoading(true);
    setErrorMessage(null);

    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        console.log("Token tidak ditemukan");
        return;
      }

      console.log("Mengambil rating untuk", unfetchedDoctors.length, "dokter");

      const ratingsPromises = unfetchedDoctors.map(async (doctor) => {
        try {
          // console.log(`Mengambil rating untuk dokter: ${doctor._id}`);
          const response = await axios.get(
            `${BASE_URL}/rating/dokter/${doctor._id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // console.log(`Respons rating untuk ${doctor._id}:`, response.data);

          if (response.data.success && response.data.data) {
            const averageRating = calculateAverageRating(response.data.data);
            // console.log(`Rata-rata rating untuk ${doctor._id}: ${averageRating}`);
            return { doctorId: doctor._id, rating: averageRating };
          }
          return { doctorId: doctor._id, rating: doctor.rating_dokter || 0 };
        } catch (error: any) {
          const errorMsg = error?.response?.data?.message || error.message;
          console.log(
            `Gagal mengambil rating untuk dokter ${doctor._id}:`,
            errorMsg
          );
          return { doctorId: doctor._id, rating: doctor.rating_dokter || 0 };
        }
      });

      const ratingsResults = await Promise.all(ratingsPromises);
      const ratingsMap: { [key: string]: number } = { ...doctorRatings };

      ratingsResults.forEach(({ doctorId, rating }) => {
        ratingsMap[doctorId] = rating;
      });

      // console.log("Peta rating akhir:", ratingsMap);
      setDoctorRatings(ratingsMap);
      setFetchedDoctorIds(
        (prev) => new Set([...prev, ...unfetchedDoctors.map((d) => d._id)])
      );
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message;
      console.log("Gagal mengambil rating dokter:", errorMsg);
      setErrorMessage("Gagal memuat rating. Silakan coba lagi nanti.");
    } finally {
      setRatingsLoading(false);
    }
  }, [doctors, fetchedDoctorIds, doctorRatings]);

  // Trigger fetch when doctors or loading change
  useEffect(() => {
    if (doctors.length > 0 && !loading) {
      fetchDoctorRatings();
    }
  }, [doctors, loading, fetchDoctorRatings]);

  // Get display rating
  const getDisplayRating = useCallback(
    (doctor: Doctor): number => {
      const apiRating = doctorRatings[doctor._id];
      // console.log(`Mendapatkan rating tampilan untuk ${doctor._id}: API=${apiRating}, Original=${doctor.rating_dokter}`);
      return apiRating !== undefined ? apiRating : doctor.rating_dokter || 0;
    },
    [doctorRatings]
  );

  const fetchDoctors = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        router.replace("/screens/signin");
        return;
      }

      const response = await axios.get(`${BASE_URL}/dokter/getall`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setDoctors(response.data);
    } catch (error) {
      console.log("Gagal fetch data dokter:", error);
    } finally {
      setLoading(false);
    }
  };
  const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    const baseUrlWithoutApi = BASE_URL.replace("/api", "");

    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return `${baseUrlWithoutApi}/${cleanPath}`;
  };

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await fetchDoctors();
    await fetchDoctorRatings();
    await fetchDoctors();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDoctors();
    }, [])
  );

  const filteredDoctors = spesialis
    ? doctors.filter((doctor) => doctor.spesialis_dokter === spesialis)
    : doctors;

  const handleDoctorPress = (doctor: Doctor) => {
    router.push({
      pathname: "/(tabs)/home/pilihjadwal",
      params: {
        doctor_Id: doctor._id,
        doctorName: doctor.nama_dokter,
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const getTitle = () => {
    return spesialis ? `Dokter Poli ${spesialis}` : "Daftar Dokter";
  };

  const getLoadingText = () => {
    return `Memuat dokter Poli ${spesialis} . . .`;
  };

  return {
    doctors: filteredDoctors,
    loading,
    spesialis,
    doctorRatings,
    ratingsLoading,
    fetchedDoctorIds,
    errorMessage,
    handleDoctorPress,
    handleBackPress,
    getTitle,
    getLoadingText,
    getDisplayRating,
    getImageUrl,
    onRefresh,
    refreshing,
  };
};

interface TimeSlot {
  _id: string;
  time: string;
  available: boolean;
}

export const useScheduleViewModel = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { doctorName, doctor_Id, spesialis } = useLocalSearchParams();

  // Fetch doctor data
  // Definisikan fungsi fetch di luar useEffect agar bisa diakses onRefresh
  const fetchDoctorData = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userId");
        router.replace("/screens/signin");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/dokter/getbyid/${doctor_Id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const doctor = response.data;
      if (doctor) {
        setDoctorId(doctor._id);
      }
    } catch (error: any) {
      console.log(
        "Error fetching doctor data:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const fetchSchedule = async () => {
    if (!doctorId) return;

    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        console.log("Token tidak ditemukan");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/dokter/getbyid/${doctorId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const jadwal = response.data.jadwal;
      const selectedDateOnly = new Date(selectedDate)
        .toISOString()
        .split("T")[0];

      const matchingJadwal = jadwal.find((item: any) => {
        const jadwalDateOnly = new Date(item.tanggal)
          .toISOString()
          .split("T")[0];
        return jadwalDateOnly === selectedDateOnly;
      });

      if (matchingJadwal) {
        setAvailableTimes(matchingJadwal.jam);
      } else {
        setAvailableTimes([]);
      }
    } catch (error: any) {
      if (error.response) {
        console.log("API Error:", error.response.data);
        console.log("Status code:", error.response.status);
      } else {
        console.log("Error message:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // useEffect untuk fetch doctor data
  useEffect(() => {
    fetchDoctorData();
  }, [doctor_Id]);

  // useEffect untuk fetch schedule ketika date atau doctor berubah
  useEffect(() => {
    if (doctorId) {
      fetchSchedule();
    }
  }, [selectedDate, doctorId]);

  // onRefresh callback - HANYA SATU
  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    setLoading(true);

    await fetchDoctorData();
    if (doctorId) {
      await fetchSchedule();
    }

    setRefreshing(false);
  }, [doctorId, doctor_Id, selectedDate]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const calculateEndTime = (date: Date, time: string): string => {
    const [hour, minute] = time.split(":").map(Number);
    const endDate = new Date(date);
    endDate.setHours(hour);
    endDate.setMinutes(minute);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const hours = String(endDate.getHours()).padStart(2, "0");
    const minutes = String(endDate.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const handleSelectSchedule = async () => {
    if (!selectedTime) {
      Alert.alert("Peringatan", "Pilih waktu terlebih dahulu.");
      return;
    }

    try {
      const userId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("userToken");

      if (!userId) throw new Error("ID masyarakat tidak ditemukan");
      if (!token) {
        console.log("Token tidak ditemukan");
        return;
      }

      const selectedJam = availableTimes.find(
        (item) => item.time === selectedTime
      );

      if (!selectedJam) {
        Alert.alert("Peringatan", "Waktu tidak tersedia.");
        return;
      }

      const jamId = selectedJam._id;
      const tanggalFormatted = selectedDate.toISOString();
      const jam_selesai = calculateEndTime(selectedDate, selectedTime);

      await axios.patch(
        `${BASE_URL}/dokter/jadwal/${doctorId}/jam/${jamId}`,
        {
          tanggal: tanggalFormatted,
          jam_mulai: selectedTime,
          jam_selesai,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push({
        pathname: "/(tabs)/home/keluhan",
        params: {
          doctor_Id,
          spesialis,
          selectedTime,
          selectedDate: tanggalFormatted,
        },
      });
    } catch (error: any) {
      if (error.response) {
        console.log("API Error:", error.response.data);
        Alert.alert(
          "Gagal",
          error.response.data.message || "Terjadi kesalahan."
        );
      } else {
        console.log("Error message:", error.message);
        Alert.alert("Gagal", "Terjadi kesalahan jaringan.");
      }
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return {
    // State
    selectedDate,
    availableTimes,
    selectedTime,
    loading,
    doctorName,
    onRefresh,
    refreshing,

    // Actions
    handleDateChange,
    handleTimeSelect,
    handleSelectSchedule,
    handleGoBack,
  };
};

interface KeluhanViewModelProps {
  doctor_Id: string;
  selectedTime: string;
  selectedDate: string;
}

export const useKeluhanViewModel = ({
  doctor_Id,
  selectedTime,
  selectedDate,
}: KeluhanViewModelProps) => {
  const router = useRouter();
  const [keluhanText, setKeluhanText] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) {
          await SecureStore.deleteItemAsync("userToken");
          await SecureStore.deleteItemAsync("userId");
          router.replace("/screens/signin");
          return;
        }

        const res = await axios.get(`${BASE_URL}/dokter/getbyid/${doctor_Id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setDoctorId(res.data._id);
      } catch (err) {
        Alert.alert("Error", "Gagal mengambil data dokter.");
      }
    };

    fetchDoctor();
  }, [doctor_Id]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.log("No userId found in SecureStore");
        }
      } catch (err) {
        console.log("Gagal mengambil data pengguna.");
      }
    };

    fetchUserId();
  }, []);

  const handleSubmit = async () => {
    if (
      !doctorId ||
      !userId ||
      !selectedTime ||
      !selectedDate ||
      !keluhanText
    ) {
      Alert.alert("Data tidak lengkap", "Pastikan semua data tersedia.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const date = new Date(selectedDate as string);
      const [hour, minute] = (selectedTime as string).split(":").map(Number);
      const jamSelesaiDate = new Date(date);
      jamSelesaiDate.setHours(hour);
      jamSelesaiDate.setMinutes(minute + 30);

      const payload = {
        dokter_id: doctorId,
        masyarakat_id: userId,
        tgl_konsul: date.toISOString(),
        jam_konsul: selectedTime,
        keluhan_pasien: keluhanText,
        jumlah_konsul: 1,
        status_konsul: "menunggu",
      };

      await axios.post(`${BASE_URL}/jadwal/create`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Sukses", "Jadwal konsultasi berhasil dibuat!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Gagal",
        error?.response?.data?.message || "Terjadi kesalahan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return {
    keluhanText,
    setKeluhanText,
    isLoading,
    handleSubmit,
    handleBack,
  };
};
