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
    // Verificar se há pendências na fila de sincronização
    const queue = await this.offline.getQueue();
    
    // Se houver pendências, priorizar o cache local para evitar sobrescrever
    // as alterações locais com dados desatualizados do servidor antes do sync.
    if (queue.length > 0) {
      return await this.offline.getSavedTrips();
    }

    const remote = await this.repository.getSavedTravels();
    if (remote.length > 0) {
      await this.offline.setSavedTrips(remote);
      return remote;
    }
    return await this.offline.getSavedTrips();
  }

async updateSavedStatus(id: string, saved: boolean) {
    let error = null;
    
    try {
      const response = await supabase
        .from("viagem")
        .update({ salvo: saved }) 
        .eq("id", id);
      error = response.error;
    } catch (e) {
      error = e;
    }

    if (error) {
      // Usamos console.log ou warn para evitar LogBox (tela vermelha) no app,
      // já que isso é um comportamento esperado quando offline.
      if (process.env.NODE_ENV !== "test") console.log("Modo Offline: Salvando alteração localmente. Erro original:", error);
      
      // Fallback: Tentar salvar localmente (Offline First)
      try {
        const cachedTrips = await this.offline.getCachedTrips();
        const trip = cachedTrips.find(t => t.id === id);
        
        if (trip) {
          if (saved) {
            await this.offline.saveTripLocally({ ...trip, saved: true });
          } else {
            await this.offline.unsaveTripLocally(id);
          }
          return true; // Sucesso local
        }
      } catch (localError) {
        if (process.env.NODE_ENV !== "test") console.error("Erro ao salvar localmente:", localError);
      }

      return false;
    }

    // Sucesso no servidor: Atualizar cache local para consistência offline imediata
    try {
      if (saved) {
        const cachedTrips = await this.offline.getCachedTrips();
        const trip = cachedTrips.find(t => t.id === id);
        if (trip) {
           await this.offline.cacheSavedTrip({ ...trip, saved: true });
        }
      } else {
        await this.offline.removeSavedTripFromCache(id);
      }
    } catch (ignore) {}

    return true;
  }

  async syncPendingChanges() {
    try {
      const queue = await this.offline.getQueue();
      if (queue.length === 0) return;

      if (process.env.NODE_ENV !== "test") console.log(`Sincronizando ${queue.length} alterações pendentes...`);

      // Processar do mais antigo para o mais recente
      const itemsToProcess = [...queue].reverse();
      const remainingQueue = [];

      for (const item of itemsToProcess) {
        const { error } = await supabase
          .from("viagem")
          .update({ salvo: item.type === "save" })
          .eq("id", item.id);

        if (error) {
          if (process.env.NODE_ENV !== "test") console.error(`Erro ao sincronizar item ${item.id}:`, error);
          remainingQueue.push(item);
        } else {
          if (process.env.NODE_ENV !== "test") console.log(`Item ${item.id} sincronizado com sucesso (${item.type})`);
        }
      }

      // Atualizar a fila apenas com os itens que falharam (mantendo a ordem original LIFO para setQueue)
      await this.offline.setQueue(remainingQueue.reverse());
      
      // Atualizar caches após sincronização
      if (remainingQueue.length < queue.length) {
        await this.listAllTravels();
        await this.listSavedTravels();
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "test") console.error("Erro durante sincronização:", error);
    }
  }
}
