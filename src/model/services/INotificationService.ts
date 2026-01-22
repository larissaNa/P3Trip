import { NotificationEntity } from "../entities/Notification";

export interface INotificationService {
  registerAndSavePushToken(): Promise<string>;
  saveNotification(notification: {
    id?: string;
    title?: string;
    body?: string;
    data?: unknown;
  }): Promise<void>;
  getHistory(): Promise<NotificationEntity[]>;
  setupListeners(
    onReceive: (notification: {
      id?: string;
      title?: string;
      body?: string;
      data?: unknown;
    }) => void,
    onResponse: (response: unknown) => void
  ): () => void;
}
