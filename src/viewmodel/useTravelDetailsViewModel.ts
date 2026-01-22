import { useState, useMemo, useCallback } from "react";
import {
  Dimensions,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { getTravelUseCases } from "../di/container";
import { Travel } from "../model/entities/Travel";

export interface TravelDetailsViewModelProtocol {
  isSaved: boolean;
  currentImageIndex: number;
  screenWidth: number;
  hasMultipleImages: boolean;
  carouselItemWidth: number;
  onCarouselScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  toggleSave: () => Promise<void>;
  openWhatsApp: () => void;
}

export function useTravelDetailsViewModel(
  travel: Travel
): TravelDetailsViewModelProtocol {
  const usecases = getTravelUseCases();

  /* =======================
   * STATE
   * ======================= */
  const [isSaved, setIsSaved] = useState<boolean>(travel.saved);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  /* =======================
   * DERIVED DATA
   * ======================= */
  const screenWidth = Dimensions.get("window").width;

  const hasMultipleImages = useMemo<boolean>(() => {
    return Array.isArray(travel.images) && travel.images.length > 1;
  }, [travel.images]);

  const carouselItemWidth = useMemo<number>(() => {
    return screenWidth - 32 + 16;
  }, [screenWidth]);

  /* =======================
   * ACTIONS
   * ======================= */
  const onCarouselScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / carouselItemWidth);
      setCurrentImageIndex(index);
    },
    [carouselItemWidth]
  );

  const toggleSave = useCallback(async (): Promise<void> => {
    const previous = isSaved;
    const next = !previous;

    setIsSaved(next);

    try {
      const ok = await usecases.updateSavedStatus(travel.id, next);
      if (!ok) setIsSaved(previous);
    } catch {
      setIsSaved(previous);
    }
  }, [isSaved, travel.id]);

  const openWhatsApp = useCallback((): void => {
    const phone = "5586999653516";
    const message = `Olá! Quero reservar o pacote: ${travel.title}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    void Linking.openURL(url).catch(() => {});
  }, [travel.title]);

  /* =======================
   * RETURN
   * ======================= */
  return {
    // state
    isSaved,
    currentImageIndex,

    // layout / derived
    screenWidth,
    hasMultipleImages,
    carouselItemWidth,

    // actions
    onCarouselScrollEnd,
    toggleSave,
    openWhatsApp,
  };
}
