import { Travel } from "../entities/Travel";

type QueueItem = { type: "save" | "unsave"; id: string };

export interface IOfflineStorageService {
  getCachedTrips(): Promise<Travel[]>;
  setCachedTrips(trips: Travel[]): Promise<void>;
  getSavedTrips(): Promise<Travel[]>;
  setSavedTrips(trips: Travel[]): Promise<void>;
  saveTripLocally(travel: Travel): Promise<void>;
  unsaveTripLocally(id: string): Promise<void>;
  cacheSavedTrip(travel: Travel): Promise<void>;
  removeSavedTripFromCache(id: string): Promise<void>;
  getQueue(): Promise<QueueItem[]>;
  setQueue(items: QueueItem[]): Promise<void>;
  enqueue(item: QueueItem): Promise<void>;
  clearQueue(): Promise<void>;
}
