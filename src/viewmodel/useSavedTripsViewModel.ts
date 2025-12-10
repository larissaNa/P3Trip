// viewmodel/useSavedTripsViewModel.ts

import { useEffect, useState } from "react";
import { Travel } from "../model/entities/Travel";
import { TravelService } from "../model/services/TravelService";

export const useSavedTripsViewModel = () => {
  const service = new TravelService();

  const [savedTrips, setSavedTrips] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    const data = await service.listSavedTravels();
    setSavedTrips(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  return { savedTrips, loading, reload: loadSaved };
};
