import { useState, useMemo, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Animated, LayoutChangeEvent, ScrollView } from "react-native";
import { Travel } from "../model/entities/Travel";
import { TravelService } from "../model/services/TravelService";

export const HomeViewModel = () => {
  const service = new TravelService();

  /* ======================
   * DATA
   * ====================== */
  const [rawTravels, setRawTravels] = useState<Travel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  /* ======================
   * UI STATE
   * ====================== */
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  /* ======================
   * LOAD
   * ====================== */
  const loadTravels = async () => {
    setLoading(true);
    try {
      const travels = await service.listAllTravels();
      setRawTravels(travels);
    } catch {
      setRawTravels([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTravels();
    }, [])
  );

  /* ======================
   * SEARCH
   * ====================== */
  const search = (query: string) => {
    setSearchQuery(query);
  };

  const filteredTravels = useMemo(() => {
    if (!searchQuery.trim()) return rawTravels;

    const lower = searchQuery.toLowerCase();
    return rawTravels.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        t.destination.toLowerCase().includes(lower)
    );
  }, [rawTravels, searchQuery]);

  /* ======================
   * SCROLL BEHAVIOR
   * ====================== */
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollTop(offsetY > 300);
      },
    }
  );

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onNavbarLayout = (event: LayoutChangeEvent) => {
    setNavbarHeight(event.nativeEvent.layout.height);
  };

  /* ======================
   * RETURN (VIEW CONTRACT)
   * ====================== */
  return {
    // data
    travelData: filteredTravels,
    loading,

    // search & reload
    search,
    reload: loadTravels,

    // scroll / ui
    scrollY,
    onScroll,
    showScrollTop,
    scrollToTop,
    navbarHeight,
    onNavbarLayout,
    scrollViewRef,
  };
};
