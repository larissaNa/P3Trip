// viewmodel/useSavedTripsViewModel.ts

import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Travel } from "../model/entities/Travel";
import { TravelService } from "../model/services/TravelService";

export interface SavedTripsViewModelProtocol {
  savedTrips: Travel[];
  loading: boolean;
  reload: () => Promise<void>;
}

export const useSavedTripsViewModel = (): SavedTripsViewModelProtocol => {
  const service = new TravelService();

  const [savedTrips, setSavedTrips] = useState<Travel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSaved = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await service.listSavedTravels();
      setSavedTrips(data);
    } catch {
      setSavedTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [])
  );

  return { savedTrips, loading, reload: loadSaved };
};
