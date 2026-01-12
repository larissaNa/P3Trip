import { useEffect, useState, useMemo } from "react";
import { Travel } from "../model/entities/Travel";
import { TravelService } from "../model/services/TravelService";

export const HomeViewModel = () => {
  const service = new TravelService();

  const [rawTravels, setRawTravels] = useState<Travel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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

  const filteredTravels = useMemo(() => {
    if (!searchQuery.trim()) return rawTravels;
    
    const lower = searchQuery.toLowerCase();
    return rawTravels.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        t.destination.toLowerCase().includes(lower)
    );
  }, [rawTravels, searchQuery]);

  const search = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    loadTravels();
  }, []);

  return {
    travelData: filteredTravels,
    loading,
    reload: loadTravels,
    search,
  };
};