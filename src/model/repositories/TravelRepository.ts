// model/repositories/TravelRepository.ts

import { supabase } from "../../infra/supabase/supabase";
import { Travel } from "../entities/Travel";

export class TravelRepository {
  async getAllTravels(): Promise<Travel[]> {
  const { data, error } = await supabase.from("viagem").select("*");

  if (error) {
    console.error("Erro ao buscar viagens:", error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    title: item.titulo,
    description: item.descricao,
    destination: item.destino,
    price: item.preco,
    images: item.imagens ?? [],      // << garante array
    saved: item.salvo ?? false,
    dateRange: item.data_range,
    days: item.dias,
  }));
}


  async getSavedTravels(): Promise<Travel[]> {
    const { data, error } = await supabase
      .from("viagem")
      .select("*")
      .eq("salvo", true);

    if (error) {
      console.error("Erro ao buscar viagens salvas:", error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      title: item.titulo,
      description: item.descricao,
      destination: item.destino,
      price: item.preco,
      images: item.imagens || [],
      saved: item.salvo ?? false,
      dateRange: item.data_range,
      days: item.dias,
    }));
  }
}
