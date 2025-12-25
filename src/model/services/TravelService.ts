import { supabase } from "../../infra/supabase/supabase";
import { TravelRepository } from "../repositories/TravelRepository";
import { OfflineStorageService } from "./OfflineStorageService";
import { Travel } from "../entities/Travel";

export class TravelService {
  private repository: TravelRepository;
  private offline: OfflineStorageService;

  constructor() {
    this.repository = new TravelRepository();
    this.offline = new OfflineStorageService();
  }

  async listAllTravels() {
    const data = await this.repository.getAllTravels();
    if (data.length > 0) {
      await this.offline.setCachedTrips(data);
    }
    return data.length > 0 ? data : await this.offline.getCachedTrips();
  }

  async listSavedTravels() {
    const remote = await this.repository.getSavedTravels();
    if (remote.length > 0) {
      await this.offline.setSavedTrips(remote);
      return remote;
    }
    return await this.offline.getSavedTrips();
  }

async updateSavedStatus(id: string, saved: boolean) {
    const { error } = await supabase
      .from("viagem")
    .update({ salvo: saved }) 
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar saved:", error);
      return false;
    }

    return true;
  }
}
