import { ScrollView, View, Text, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Navbar from "./components/navbar/Navbar";
import TravelCard from "./components/cards/TravelCard";
import { HomeViewModel } from "../viewmodel/useHomeViewModel";

export default function HomeScreen() {
  const vm = HomeViewModel();
  const navigation = useNavigation<any>();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Navbar />

      {vm.loading ? (
        <ActivityIndicator size="large" color="#2c83e5" style={{ marginTop: 40 }} />
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
