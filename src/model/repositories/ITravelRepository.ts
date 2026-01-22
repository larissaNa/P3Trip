import { Travel } from "../entities/Travel";

export interface ITravelRepository {
  getAllTravels(): Promise<Travel[]>;
  getSavedTravels(): Promise<Travel[]>;
  getTravelById(id: string): Promise<Travel | null>;
  saveTravel(id: string): Promise<void>;
  unsaveTravel(id: string): Promise<void>;
}
