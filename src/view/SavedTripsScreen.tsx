import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSavedTripsViewModel } from "../viewmodel/useSavedTripsViewModel";
import TravelCard from "../view/components/cards/TravelCard";

export default function SavedTripsScreen({ navigation }: any) {
  const vm = useSavedTripsViewModel();

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

      {vm.loading ? (
        <ActivityIndicator size="large" color="#2c83e5" style={{ marginTop: 40 }} />
      ) : vm.savedTrips.length === 0 ? (
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
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
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