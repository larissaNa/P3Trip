import { useEffect, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import { Notification } from "../model/entities/Notification";
import { NotificationRepository } from "../model/repositories/NotificationRepository";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useNotificationViewModel() {
  const repository = new NotificationRepository();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    const data = await repository.getAll();

    if (data.length === 0) {
      setNotifications([
        {
          id: "empty",
          title: "Nenhuma notificação!",
          message: "Ainda não recebemos notificações para este dispositivo.",
          receivedAt: "",
          icon: "bell",
        },
      ]);
    } else {
      setNotifications(data);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body } = notification.request.content;

        const newItem: Notification = {
          id: notification.request.identifier,
          title: title || "Notificação",
          message: body || "",
          receivedAt: new Date().toISOString(),
          icon: "bell",
        };

        setNotifications((prev) => {
          const current = prev.filter((n) => n.id !== "empty");
          return [newItem, ...current];
        });
      }
    );

    return () => subscription.remove();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  return {
    notifications: notifications.map((n) => ({
      ...n,
      time: formatDate(n.receivedAt),
    })),
    refreshing,
    onRefresh,
  };
}
