import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import Navbar from "./components/navbar/Navbar";
import TravelCard from "./components/cards/TravelCard";
import { styles } from "./styles";
import { HomeViewModel } from "../viewmodel/HomeViewModel";

export default function HomeScreen() {
  const vm = HomeViewModel();

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
          <TravelCard key={index} {...item} />
        ))}
      </ScrollView>
    </View>
  );
}
