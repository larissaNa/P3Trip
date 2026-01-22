import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "../../infra/supabase/supabase";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { NotificationEntity } from "../entities/Notification";

export class NotificationService {
  private repo: NotificationRepository = new NotificationRepository();

  async registerForPushNotifications(): Promise<string> {
    if (!Device.isDevice) {
      throw new Error("DEVICE_NOT_SUPPORTED");
    }

    const permission: boolean = await this.ensurePermissions();
    if (!permission) {
      throw new Error("PERMISSION_DENIED");
    }

    const token: string = await this.getPushToken();
    await this.setupAndroidChannel();
    return token;
  }

  async registerAndSavePushToken(): Promise<string> {
    const token: string = await this.registerForPushNotifications();

    const { error }: { error: Error | null } = await supabase
      .from("push_tokens")
      .upsert(
        [{ token, updated_at: new Date().toISOString() }],
        { onConflict: "token" }
      );

    if (error) {
      throw new Error("SUPABASE_ERROR");
    }

    return token;
  }

  async saveNotification(
    notification: Notifications.Notification
  ): Promise<void> {
    const entity: NotificationEntity = {
      id: notification.request.identifier || String(Date.now()),
      title: notification.request.content.title ?? "",
      body: notification.request.content.body ?? "",
      receivedAt: new Date().toISOString(),
      data: notification.request.content.data,
    };

    await this.repo.append(entity);
  }

  async getHistory(): Promise<NotificationEntity[]> {
    return this.repo.getAll();
  }

  setupListeners(
    onReceive: (notification: Notifications.Notification) => void,
    onResponse: (response: Notifications.NotificationResponse) => void
  ): () => void {
    const receiveSub: Notifications.Subscription =
      Notifications.addNotificationReceivedListener(onReceive);

    const responseSub: Notifications.Subscription =
      Notifications.addNotificationResponseReceivedListener(onResponse);

    return (): void => {
      receiveSub.remove();
      responseSub.remove();
    };
  }

  // ===== PRIVATE =====

  private async ensurePermissions(): Promise<boolean> {
    const {
      status,
    }: Notifications.NotificationPermissionsStatus =
      await Notifications.getPermissionsAsync();

    if (status === "granted") return true;

    const request: Notifications.NotificationPermissionsStatus =
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

    return request.status === "granted";
  }

  private async getPushToken(): Promise<string> {
    const projectId: string | undefined =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const token: Notifications.ExpoPushToken =
      await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : {}
      );

    return token.data;
  }

  private async setupAndroidChannel(): Promise<void> {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }
}
