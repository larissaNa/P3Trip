import { useState } from "react";
import { Linking } from "react-native";
import { TravelService } from "../model/services/TravelService";

export function useTravelDetailsViewModel(travel: any) {
  const [isSaved, setIsSaved] = useState(travel.saved);
  const service = new TravelService();

  const toggleSave = async () => {
    const previousStatus = isSaved;
    const newStatus = !previousStatus;
    setIsSaved(newStatus);
    try {
      const ok = await service.updateSavedStatus(travel.id, newStatus);
      if (!ok) setIsSaved(previousStatus);
    } catch {
      setIsSaved(previousStatus);
    }
  };

  const openWhatsApp = () => {
    const phone = "5586998527609";
    const message = `Olá! Quero reservar o pacote: ${travel.title}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    void Linking.openURL(url).catch(() => {});
  };

  return {
    isSaved,
    toggleSave,
    openWhatsApp,
  };
}
