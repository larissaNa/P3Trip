import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "./components/navbar/Navbar";
import TravelCard from "./components/cards/TravelCard";
import { HomeViewModel } from "../viewmodel/useHomeViewModel";

export default function HomeScreen() {
  const vm = HomeViewModel();
  const navigation = useNavigation<any>();

  return (
    <View style={{ flex: 1, backgroundColor: "#e8e8e4" }}>
      <Navbar />

      {vm.loading ? (
        <ActivityIndicator size="large" color="#2c83e5" style={{ marginTop: 40 }} />
      ) : vm.travelData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#777" />
          <Text style={styles.emptyTitle}>Sem dados disponíveis</Text>
          <Text style={styles.emptySubtitle}>
            Conexão indisponível ou nenhum conteúdo em cache. Tente novamente.
          </Text>
          <TouchableOpacity onPress={vm.reload} style={styles.button}>
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {vm.travelData.map((item) => (
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  emptySubtitle: {
    marginTop: 6,
    textAlign: "center",
    color: "#777",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2c83e5",
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 26,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
