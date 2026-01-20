import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { NotificationService } from "../model/services/NotificationService";
import * as Notifications from "expo-notifications";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
};

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

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    const service = new NotificationService();
    const history = await service.getNotificationHistory();
    
    if (!history || history.length === 0) {
      setNotifications([
        {
          id: "empty",
          title: "Nenhuma notificação!",
          message: "Ainda não recebemos notificações para este dispositivo.",
          time: "",
          icon: "bell",
        },
      ]);
    } else {
      const items: NotificationItem[] = history.map((item) => ({
        id: item.id,
        title: item.title || "Notificação",
        message: item.body,
        time: formatDate(item.receivedAt),
        icon: "bell",
      }));
      setNotifications(items);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      const newItem: NotificationItem = {
        id: notification.request.identifier,
        title: title || "Notificação",
        message: body || "",
        time: formatDate(new Date().toISOString()),
        icon: "bell",
      };

      setNotifications((prev) => {
        const current = prev.filter((p) => p.id !== "empty");
        return [newItem, ...current];
      });
    });

    return () => subscription.remove();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView 
        style={{ paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2c83e5"]} />
        }
      >
        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <Feather name={item.icon as any} size={22} color="#2c83e5" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMsg}>{item.message}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#edf1f5ff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito-ExtraBold",
    color: "#191919ff",
  },
  
  permissionWarning: {
    backgroundColor: "#ffecb3",
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  permissionText: {
    color: "#856404",
    fontFamily: "Nunito-Bold",
    fontSize: 14,
  },

  card: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#424141ff",
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: "Nunito-Bold",
    color: "#333",
  },

  cardMsg: {
    marginTop: 4,
    fontFamily: "Nunito-Regular",
    color: "#555",
  },

  cardTime: {
    marginTop: 4,
    fontFamily: "Nunito-Regular",
    color: "#999",
    fontSize: 12,
  },
});