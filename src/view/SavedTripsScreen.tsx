import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useSavedTripsViewModel } from "../viewmodel/useSavedTripsViewModel";
import TravelCard from "../view/components/cards/TravelCard";
import { RootStackParamList } from "../navigator/AppNavigator";

type SavedTripsNavProp = NativeStackNavigationProp<RootStackParamList, "SavedTrips">;

export default function SavedTripsScreen() {
  const navigation = useNavigation<SavedTripsNavProp>();
  const vm = useSavedTripsViewModel();

  // Loading tela cheia apenas se não houver dados
  const showFullScreenLoading = vm.loading && vm.savedTrips.length === 0;

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viagens Salvas</Text>
        <View style={{ width: 26 }} />
      </View>

      {showFullScreenLoading ? (
        <ActivityIndicator size="large" color="#2c83e5" style={{ marginTop: 40 }} />
      ) : vm.savedTrips.length === 0 ? (
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={vm.loading}
              onRefresh={vm.reload}
              colors={["#2c83e5"]}
              tintColor="#2c83e5"
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={60} color="#777" />
            <Text style={styles.emptyTitle}>Nenhuma viagem salva</Text>
            <Text style={styles.emptySubtitle}>
              Comece a salvar suas viagens favoritas para visualizar depois.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Explorar viagens</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView 
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={vm.loading}
              onRefresh={vm.reload}
              colors={["#2c83e5"]}
              tintColor="#2c83e5"
            />
          }
        >
          {vm.savedTrips.map((item) => (
            <TravelCard
              key={item.id}
              {...item}
              onPress={() => navigation.navigate("TravelDetails", { travel: item })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDF1F5FF" },

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

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontFamily: "Nunito-Bold",
    color: "#333",
  },

  emptySubtitle: {
    marginTop: 6,
    textAlign: "center",
    fontFamily: "Nunito-Regular",
    color: "#777",
  },

  button: {
    marginTop: 20,
    backgroundColor: "#2c83e5",
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Nunito-SemiBold",
  },
});