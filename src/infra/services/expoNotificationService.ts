import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "../supabase/supabase";
import { NotificationRepository } from "../repositories/notificationRepository";
import { NotificationEntity } from "../../model/entities/Notification";
import { INotificationService } from "../../model/services/INotificationService";

export class ExpoNotificationService implements INotificationService {
  private repo = new NotificationRepository();

  async registerAndSavePushToken(): Promise<string> {
    const token = await this.registerForPush();
    const { error } = await supabase
      .from("push_tokens")
      .upsert([{ token, updated_at: new Date().toISOString() }], {
        onConflict: "token",
      });
    if (error) throw new Error("SUPABASE_ERROR");
    return token;
  }

  async saveNotification(notification: {
    id?: string;
    title?: string;
    body?: string;
    data?: unknown;
  }): Promise<void> {
    const entity: NotificationEntity = {
      id: notification.id || String(Date.now()),
      title: notification.title ?? "",
      body: notification.body ?? "",
      receivedAt: new Date().toISOString(),
      data: notification.data,
    };
    await this.repo.append(entity);
  }

  async getHistory(): Promise<NotificationEntity[]> {
    return this.repo.getAll();
  }

  setupListeners(
    onReceive: (notification: {
      id?: string;
      title?: string;
      body?: string;
      data?: unknown;
    }) => void,
    onResponse: (response: unknown) => void
  ): () => void {
    const receiveSub = Notifications.addNotificationReceivedListener((n) => {
      onReceive({
        id: n.request.identifier,
        title: n.request.content.title ?? undefined,
        body: n.request.content.body ?? undefined,
        data: n.request.content.data,
      });
    });
    const responseSub =
      Notifications.addNotificationResponseReceivedListener((_r) => {
        onResponse(_r);
      });
    return () => {
      receiveSub.remove();
      responseSub.remove();
    };
  }

  private async registerForPush(): Promise<string> {
    if (!Device.isDevice) throw new Error("DEVICE_NOT_SUPPORTED");
    const permission = await this.ensurePermissions();
    if (!permission) throw new Error("PERMISSION_DENIED");
    const token = await this.getPushToken();
    await this.setupAndroidChannel();
    return token;
  }

  private async ensurePermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return true;
    const request = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return request.status === "granted";
  }

  private async getPushToken(): Promise<string> {
    const projectId: string | undefined =
      (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;
    const token = await Notifications.getExpoPushTokenAsync(
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
