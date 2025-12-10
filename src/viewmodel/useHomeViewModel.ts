import { useEffect, useState } from "react";
import { Travel } from "../model/entities/Travel";
import { TravelRepository } from "../model/repositories/TravelRepository";

export const HomeViewModel = () => {
  const repo = new TravelRepository();

  const [travelData, setTravelData] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTravels = async () => {
    setLoading(true);
    const travels = await repo.getAllTravels();
    setTravelData(travels);
    setLoading(false);
  };

  useEffect(() => {
    loadTravels();
  }, []);

  return {
    travelData,
    loading,
    reload: loadTravels,
  };
};
