import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationEntity } from "../entities/Notification";

const STORAGE_KEY = "@p3trip/notifications";

export class NotificationRepository {
  async getAll(): Promise<NotificationEntity[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async saveAll(notifications: NotificationEntity[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications.slice(0, 50))
    );
  }

  async append(notification: NotificationEntity): Promise<void> {
    const current = await this.getAll();
    await this.saveAll([notification, ...current]);
  }
}
