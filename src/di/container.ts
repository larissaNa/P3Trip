import { SupabaseTravelRepository } from "../infra/repositories/supabaseTravelRepository";
import { OfflineStorageService } from "../infra/services/offlineStorageService";
import { TravelUseCases } from "../usecase/travelUseCases";
import { INotificationService } from "../model/services/INotificationService";
import { ExpoNotificationService } from "../infra/services/expoNotificationService";

const travelRepo = new SupabaseTravelRepository();
const offlineStorage = new OfflineStorageService();
const travelUseCases = new TravelUseCases(travelRepo, offlineStorage);

const notificationService: INotificationService = new ExpoNotificationService();

export const getTravelUseCases = () => travelUseCases;
export const getNotificationService = () => notificationService;
