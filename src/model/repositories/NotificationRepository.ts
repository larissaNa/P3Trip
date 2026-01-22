import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationEntity } from "../entities/Notification";

const STORAGE_KEY: string = "@p3trip/notifications";

export class NotificationRepository {
  async getAll(): Promise<NotificationEntity[]> {
    const raw: string | null = await AsyncStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      return Array.isArray(parsed)
        ? (parsed as NotificationEntity[])
        : [];
    } catch (_error: unknown) {
      return [];
    }
  }

  async saveAll(notifications: NotificationEntity[]): Promise<void> {
    const limitedNotifications: NotificationEntity[] =
      notifications.slice(0, 50);

    const serialized: string = JSON.stringify(limitedNotifications);

    await AsyncStorage.setItem(STORAGE_KEY, serialized);
  }

  async append(notification: NotificationEntity): Promise<void> {
    const current: NotificationEntity[] = await this.getAll();

    const next: NotificationEntity[] = [
      notification,
      ...current,
    ];

    await this.saveAll(next);
  }
}
