import { useEffect, useState } from "react";
import { Travel } from "../model/entities/Travel";
import { TravelService } from "../model/services/TravelService";

export const HomeViewModel = () => {
  const service = new TravelService();

  const [travelData, setTravelData] = useState<Travel[]>([]);
  const [allTravels, setAllTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTravels = async () => {
    setLoading(true);
    try {
      const travels = await service.listAllTravels();
      setAllTravels(travels);
      setTravelData(travels);
    } catch {
      setAllTravels([]);
      setTravelData([]);
    } finally {
      setLoading(false);
    }
  };

  const search = (query: string) => {
    if (!query) {
      setTravelData(allTravels);
      return;
    }
    const lower = query.toLowerCase();
    const filtered = allTravels.filter((t) =>
      t.title.toLowerCase().includes(lower) ||
      t.destination.toLowerCase().includes(lower)
    );
    setTravelData(filtered);
  };

  useEffect(() => {
    loadTravels();
  }, []);

  return {
    travelData,
    loading,
    reload: loadTravels,
    search,
  };
};
