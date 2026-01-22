import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { NotificationService } from "../model/services/NotificationService";
import { NotificationEntity } from "../model/entities/Notification";
import * as Notifications from "expo-notifications";

export interface NotificationViewModelProtocol {
  notifications: NotificationEntity[];
  loading: boolean;
  reload: () => Promise<void>;
  registerPush: () => Promise<void>;
}

export function useNotificationViewModel(): NotificationViewModelProtocol {
  const service = new NotificationService();

  const [notifications, setNotifications] = useState<NotificationEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadHistory = useCallback(async (): Promise<void> => {
    setLoading(true);
    const history = await service.getHistory();

    if (history.length === 0) {
      setNotifications([
        {
          id: "empty",
          title: "Nenhuma notificação!",
          body: "Ainda não recebemos notificações.",
          receivedAt: "",
        },
      ]);
    } else {
      setNotifications(history);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();

    const unsubscribe = service.setupListeners(
      async (notification) => {
        await service.saveNotification(notification);
        loadHistory();
      },
      () => {}
    );

    return unsubscribe;
  }, [loadHistory]);

  const registerPush = async (): Promise<void> => {
    try {
      await service.registerAndSavePushToken();
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.message === "PERMISSION_DENIED") {
          Alert.alert("Permissão necessária", "Ative nas configurações");
        } else if (e.message === "DEVICE_NOT_SUPPORTED") {
          Alert.alert("Erro", "Use um dispositivo físico");
        }
      }
    }
  };

  return {
    notifications,
    loading,
    reload: loadHistory,
    registerPush,
  };
}
