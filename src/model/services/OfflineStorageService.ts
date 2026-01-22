import AsyncStorage from "@react-native-async-storage/async-storage";
import { Travel } from "../entities/Travel";

type QueueItem = {
  type: "save" | "unsave";
  id: string;
};

type StorageKeys = {
  TRIPS_CACHE: string;
  SAVED_TRIPS: string;
  SYNC_QUEUE: string;
};

const KEYS: StorageKeys = {
  TRIPS_CACHE: "@p3trip/trips",
  SAVED_TRIPS: "@p3trip/saved",
  SYNC_QUEUE: "@p3trip/sync",
};

export class OfflineStorageService {
  async getCachedTrips(): Promise<Travel[]> {
    const raw: string | null = await AsyncStorage.getItem(KEYS.TRIPS_CACHE);
    return raw ? (JSON.parse(raw) as Travel[]) : [];
  }

  async setCachedTrips(trips: Travel[]): Promise<void> {
    await AsyncStorage.setItem(
      KEYS.TRIPS_CACHE,
      JSON.stringify(trips)
    );
  }

  async getSavedTrips(): Promise<Travel[]> {
    const raw: string | null = await AsyncStorage.getItem(KEYS.SAVED_TRIPS);
    return raw ? (JSON.parse(raw) as Travel[]) : [];
  }

  async setSavedTrips(trips: Travel[]): Promise<void> {
    await AsyncStorage.setItem(
      KEYS.SAVED_TRIPS,
      JSON.stringify(trips)
    );
  }

  async saveTripLocally(travel: Travel): Promise<void> {
    try {
      const list: Travel[] = await this.getSavedTrips();

      const exists: boolean = list.some(
        (t: Travel) => t.id === travel.id
      );

      const next: Travel[] = exists
        ? list
        : [{ ...travel, saved: true }, ...list];

      await this.setSavedTrips(next);
      await this.enqueue({ type: "save", id: travel.id });

      if (process.env.NODE_ENV !== "test") {
        console.log(
          `OfflineStorage: Viagem ${travel.id} salva localmente.`
        );
      }
    } catch (e: unknown) {
      if (process.env.NODE_ENV !== "test") {
        console.error(
          "OfflineStorage: Erro ao salvar viagem localmente",
          e
        );
      }
    }
  }

  async unsaveTripLocally(id: string): Promise<void> {
    const list: Travel[] = await this.getSavedTrips();

    const next: Travel[] = list.filter(
      (t: Travel) => t.id !== id
    );

    await this.setSavedTrips(next);
    await this.enqueue({ type: "unsave", id });
  }

  async cacheSavedTrip(travel: Travel): Promise<void> {
    const list: Travel[] = await this.getSavedTrips();

    const exists: boolean = list.some(
      (t: Travel) => t.id === travel.id
    );

    if (!exists) {
      const next: Travel[] = [
        { ...travel, saved: true },
        ...list,
      ];
      await this.setSavedTrips(next);
    }
  }

  async removeSavedTripFromCache(id: string): Promise<void> {
    const list: Travel[] = await this.getSavedTrips();

    const next: Travel[] = list.filter(
      (t: Travel) => t.id !== id
    );

    await this.setSavedTrips(next);
  }

  async getQueue(): Promise<QueueItem[]> {
    const raw: string | null = await AsyncStorage.getItem(
      KEYS.SYNC_QUEUE
    );

    return raw ? (JSON.parse(raw) as QueueItem[]) : [];
  }

  async setQueue(items: QueueItem[]): Promise<void> {
    await AsyncStorage.setItem(
      KEYS.SYNC_QUEUE,
      JSON.stringify(items)
    );
  }

  async enqueue(item: QueueItem): Promise<void> {
    const queue: QueueItem[] = await this.getQueue();
    await this.setQueue([item, ...queue]);
  }

  async clearQueue(): Promise<void> {
    await this.setQueue([]);
  }
}
