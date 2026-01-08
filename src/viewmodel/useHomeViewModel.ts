import { useEffect, useState } from "react";
import { Travel } from "../model/entities/Travel";
import { TravelService } from "../model/services/TravelService";

export const HomeViewModel = () => {
  const service = new TravelService();

  const [travelData, setTravelData] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTravels = async () => {
    setLoading(true);
    try {
      const travels = await service.listAllTravels();
      setTravelData(travels);
    } catch {
      setTravelData([]);
    } finally {
      setLoading(false);
    }
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
