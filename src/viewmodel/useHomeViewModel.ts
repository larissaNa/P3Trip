import { useState, useMemo, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native";
import { Travel } from "../model/entities/Travel";
import { getTravelUseCases } from "../di/container";

export interface HomeViewModelProtocol {
  travelData: Travel[];
  loading: boolean;
  search: (query: string) => void;
  reload: () => Promise<void>;
  scrollY: Animated.Value;
  onScroll: (
    event: NativeSyntheticEvent<NativeScrollEvent> | { nativeEvent: any }
  ) => void;
  showScrollTop: boolean;
  scrollToTop: () => void;
  navbarHeight: number;
  onNavbarLayout: (event: LayoutChangeEvent) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
}

export const HomeViewModel = (): HomeViewModelProtocol => {
  const usecases = getTravelUseCases();

  /* ======================
   * DATA
   * ====================== */
  const [rawTravels, setRawTravels] = useState<Travel[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  /* ======================
   * UI STATE
   * ====================== */
  const [navbarHeight, setNavbarHeight] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  /* ======================
   * LOAD
   * ====================== */
  const loadTravels = async (): Promise<void> => {
    setLoading(true);
    try {
      const travels = await usecases.listAllTravels();
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
  const search = (query: string): void => {
    setSearchQuery(query);
  };

  const filteredTravels = useMemo<Travel[]>(() => {
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
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollTop(offsetY > 300);
      },
    }
  );

  const scrollToTop = (): void => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onNavbarLayout = (event: LayoutChangeEvent): void => {
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
