import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNotificationViewModel } from "../viewmodel/useNotificationViewModel";
import { RootStackParamList } from "../navigator/AppNavigator";

type NotificationsNavProp = NativeStackNavigationProp<RootStackParamList, "Notifications">;

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsNavProp>();
  const vm = useNotificationViewModel();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Ionicons name="arrow-back-outline" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl 
            refreshing={vm.loading} 
            onRefresh={vm.reload} 
            colors={["#0056b3"]} // Android
            tintColor="#0056b3"  // iOS
          />
        }
      >
        {vm.notifications.map((item) => {
          if (item.id === 'empty') {
             return (
               <View key={item.id} style={[styles.card, { borderBottomWidth: 0, justifyContent: 'center', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }]}>
                 <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                 <Text style={[styles.cardTitle, { color: '#888', marginTop: 16 }]}>{item.title}</Text>
                 <Text style={styles.cardMsg}>{item.body}</Text>
               </View>
             );
          }

          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={async () => {
                const travel = await vm.handleNotificationPress(item);
                if (travel) {
                  navigation.navigate("TravelDetails", { travel });
                } else {
                  console.log("Não foi possível carregar a viagem ou não há viagem associada.");
                }
              }}
            >
              <View style={{ marginRight: 12, justifyContent: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#e1e8ed', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="notifications-outline" size={20} color="#0056b3" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.receivedAt ? (
                    <Text style={styles.cardTime}>
                      {new Date(item.receivedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.cardMsg}>{item.body}</Text>
                {item.receivedAt ? (
                   <Text style={styles.cardTime}>
                     {new Date(item.receivedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                   </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
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