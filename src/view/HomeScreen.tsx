import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Navbar from "./components/navbar/Navbar";
import TravelCard from "./components/cards/TravelCard";
import { HomeViewModel } from "../viewmodel/HomeViewModel";

export default function HomeScreen() {
  const vm = HomeViewModel();
  const navigation = useNavigation<any>(); // tipagem flexível para navigation

  return (
    <View style={styles.container}>
      <Navbar />

      {/* FILTROS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
      >
        {vm.filters.map((item) => (
          <TouchableOpacity key={item} style={styles.filterItem}>
            <Text style={styles.filterText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* CARDS */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {vm.travelData.map((item, index) => (
          <TravelCard
            key={index}
            {...item}
            onPress={() =>
              navigation.navigate("TravelDetails", { travel: item })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterBar: {
    marginTop: 12,
    paddingLeft: 16,
  },
  filterItem: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: "#eaeaea",
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    fontWeight: "500",
    fontSize: 14,
  },
});
