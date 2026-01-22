import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationEntity } from "../../model/entities/Notification";

const STORAGE_KEY = "@p3trip/notifications";

export class NotificationRepository {
  async getAll(): Promise<NotificationEntity[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as NotificationEntity[]) : [];
    } catch {
      return [];
    }
  }

  async saveAll(notifications: NotificationEntity[]): Promise<void> {
    const limited = notifications.slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  }

  async append(notification: NotificationEntity): Promise<void> {
    const current = await this.getAll();
    const next = [notification, ...current];
    await this.saveAll(next);
  }
}
