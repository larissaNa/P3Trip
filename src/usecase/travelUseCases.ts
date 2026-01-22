import { ITravelRepository } from "../model/repositories/ITravelRepository";
import { IOfflineStorageService } from "../model/services/IOfflineStorageService";
import { Travel } from "../model/entities/Travel";

export class TravelUseCases {
  constructor(
    private repo: ITravelRepository,
    private offline: IOfflineStorageService
  ) {}

  async listAllTravels(): Promise<Travel[]> {
    const data = await this.repo.getAllTravels();
    if (data.length > 0) {
      await this.offline.setCachedTrips(data);
      return data;
    }
    return await this.offline.getCachedTrips();
  }

  async listSavedTravels(): Promise<Travel[]> {
    const queue = await this.offline.getQueue();
    if (queue.length > 0) {
      return await this.offline.getSavedTrips();
    }
    const remote = await this.repo.getSavedTravels();
    if (remote.length > 0) {
      await this.offline.setSavedTrips(remote);
      return remote;
    }
    return await this.offline.getSavedTrips();
  }

  async getTravelById(id: string): Promise<Travel | null> {
    return await this.repo.getTravelById(id);
  }

  async updateSavedStatus(id: string, saved: boolean): Promise<boolean> {
    let error: unknown = null;
    try {
      if (saved) {
        await this.repo.saveTravel(id);
      } else {
        await this.repo.unsaveTravel(id);
      }
    } catch (e) {
      error = e;
    }

    if (error) {
      try {
        const cachedTrips = await this.offline.getCachedTrips();
        const trip = cachedTrips.find((t) => t.id === id);
        if (trip) {
          if (saved) {
            await this.offline.saveTripLocally({ ...trip, saved: true });
          } else {
            await this.offline.unsaveTripLocally(id);
          }
          return true;
        }
      } catch (_ignore) {}
      return false;
    }

    try {
      if (saved) {
        const cachedTrips = await this.offline.getCachedTrips();
        const trip = cachedTrips.find((t) => t.id === id);
        if (trip) {
          await this.offline.cacheSavedTrip({ ...trip, saved: true });
        }
      } else {
        await this.offline.removeSavedTripFromCache(id);
      }
    } catch (_ignore) {}
    return true;
  }

  async syncPendingChanges(): Promise<void> {
    try {
      const queue = await this.offline.getQueue();
      if (queue.length === 0) return;
      const itemsToProcess = [...queue].reverse();
      const remainingQueue: { type: "save" | "unsave"; id: string }[] = [];
      for (const item of itemsToProcess) {
        try {
          if (item.type === "save") {
            await this.repo.saveTravel(item.id);
          } else {
            await this.repo.unsaveTravel(item.id);
          }
        } catch (e) {
          remainingQueue.push(item);
        }
      }
      await this.offline.setQueue(remainingQueue.reverse());
      if (remainingQueue.length < queue.length) {
        await this.listAllTravels();
        await this.listSavedTravels();
      }
    } catch (error) {
      // log error silently
    }
  }
}
