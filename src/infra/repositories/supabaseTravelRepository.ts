import { supabase } from "../supabase/supabase";
import { ITravelRepository } from "../../model/repositories/ITravelRepository";
import { Travel } from "../../model/entities/Travel";

export class SupabaseTravelRepository implements ITravelRepository {
  async getAllTravels(): Promise<Travel[]> {
    const { data, error } = await supabase.from("viagem").select("*");
    if (error) {
      if (process.env.NODE_ENV !== "test") console.error("Erro ao buscar viagens:", error);
      return [];
    }
    return (data || []).map((item: any) => ({
      id: String(item.id),
      title: item.titulo,
      description: item.descricao,
      destination: item.destino,
      price: item.preco,
      images: item.imagens ?? [],
      saved: item.salvo ?? false,
      dateRange: item.data_range,
      days: item.dias,
      inclui: item.inclui ?? [],
    }));
  }

  async getSavedTravels(): Promise<Travel[]> {
    const { data, error } = await supabase
      .from("viagem")
      .select("*")
      .eq("salvo", true);
    if (error) {
      if (process.env.NODE_ENV !== "test") console.error("Erro ao buscar viagens salvas:", error);
      return [];
    }
    return (data || []).map((item: any) => ({
      id: String(item.id),
      title: item.titulo,
      description: item.descricao,
      destination: item.destino,
      price: item.preco,
      images: item.imagens ?? [],
      saved: item.salvo ?? false,
      dateRange: item.data_range,
      days: item.dias,
    }));
  }

  async getTravelById(id: string): Promise<Travel | null> {
    const { data, error } = await supabase
      .from("viagem")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: String(data.id),
      title: data.titulo,
      description: data.descricao,
      destination: data.destino,
      price: data.preco,
      images: data.imagens ?? [],
      saved: data.salvo ?? false,
      dateRange: data.data_range,
      days: data.dias,
      inclui: data.inclui ?? [],
    };
  }

  async saveTravel(id: string): Promise<void> {
    const { error } = await supabase
      .from("viagem")
      .update({ salvo: true })
      .eq("id", id);
    if (error) throw error;
  }

  async unsaveTravel(id: string): Promise<void> {
    const { error } = await supabase
      .from("viagem")
      .update({ salvo: false })
      .eq("id", id);
    if (error) throw error;
  }
}
