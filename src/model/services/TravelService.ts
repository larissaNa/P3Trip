// model/service/TravelService.ts

import { supabase } from "../../infra/supabase/supabase";
import { TravelRepository } from "../repositories/TravelRepository";

export class TravelService {
  [x: string]: any;
  private repository: TravelRepository;

  constructor() {
    this.repository = new TravelRepository();
  }

  async listAllTravels() {
    return await this.repository.getAllTravels();
  }

  async listSavedTravels() {
    return await this.repository.getSavedTravels();
  }
  // TravelService.ts

async updateSavedStatus(id: string, saved: boolean) {
    const { error } = await supabase
      .from("viagem")
    .update({ salvo: saved }) // <<< SUA COLUNA NO BD É 'salvo', não 'saved'
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar saved:", error);
      return false;
    }

    return true;
  }

}
