import { useState, useMemo, useCallback } from "react";
import { Dimensions, Linking, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { TravelService } from "../model/services/TravelService";
import { Travel } from "../model/entities/Travel";

export function useTravelDetailsViewModel(travel: Travel) {
  const service = new TravelService();

  /* =======================
   * STATE
   * ======================= */
  const [isSaved, setIsSaved] = useState(travel.saved);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* =======================
   * DERIVED DATA
   * ======================= */
  const screenWidth = Dimensions.get("window").width;

  const hasMultipleImages = useMemo(() => {
    return Array.isArray(travel.images) && travel.images.length > 1;
  }, [travel.images]);

  const carouselItemWidth = useMemo(() => {
    return screenWidth - 32 + 16;
  }, [screenWidth]);

  /* =======================
   * ACTIONS
   * ======================= */
  const onCarouselScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / carouselItemWidth);
      setCurrentImageIndex(index);
    },
    [carouselItemWidth]
  );

  const toggleSave = useCallback(async () => {
    const previous = isSaved;
    const next = !previous;

    setIsSaved(next);

    try {
      const ok = await service.updateSavedStatus(travel.id, next);
      if (!ok) setIsSaved(previous);
    } catch {
      setIsSaved(previous);
    }
  }, [isSaved, travel.id]);

  const openWhatsApp = useCallback(() => {
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
