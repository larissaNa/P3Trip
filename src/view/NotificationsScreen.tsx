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
        refreshControl={
          <RefreshControl refreshing={vm.loading} onRefresh={vm.reload} />
        }
      >
        {vm.notifications.map((item) => (
          <View key={item.id}>
            <Text>{item.title}</Text>
            <Text>{item.body}</Text>
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