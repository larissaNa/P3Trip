import { useEffect, useState } from "react";
import { Travel } from "../model/entities/Travel";
import { TravelService } from "../model/services/TravelService";
import { NotificationService } from "../model/services/NotificationService";
import { supabase } from "../infra/supabase/supabase";

export const HomeViewModel = () => {
  const service = new TravelService();
  const notificationService = new NotificationService();

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

  const registerForNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotificationsAsync();
      if (token) {
        // Usamos upsert para evitar duplicatas do mesmo token
        await supabase
          .from('push_tokens')
          .upsert({ token: token }, { onConflict: 'token' });
      }
    } catch (error) {
      console.log('Erro ao registrar notificações:', error);
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
    registerForNotifications();
  }, []);

  return {
    travelData,
    loading,
    reload: loadTravels,
    search,
  };
};
