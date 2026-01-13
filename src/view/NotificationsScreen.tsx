import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function NotificationsScreen({ navigation }: any) {

  const notifications = [
    {
      title: "Promoção Imperdível!",
      message: "Viagens para Maldivas com 30% de desconto. Aproveite agora!",
      time: "2 horas atrás",
      icon: "tag",
    },
    {
      title: "Lembrete de Viagem",
      message: "Sua viagem para Paris está chegando. Faltam 15 dias!",
      time: "1 dia atrás",
      icon: "bell",
    },
    {
      title: "Novos pacotes",
      message: "Lançamos novos roteiros exclusivos para a Ilha do Mel!",
      time: "3 dias atrás",
      icon: "map",
    },
  ];

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

      <ScrollView style={{ paddingHorizontal: 16 }}>
        {notifications.map((item, index) => (
          <View key={index} style={styles.card}>
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