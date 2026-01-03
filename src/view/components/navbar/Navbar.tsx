import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Navbar() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.headerContainer}>
      {/* Linha superior */}
      <View style={styles.row}>
        {/* Logo */}
        <View style={styles.logo} />

        <View style={styles.titleContainer}>
          <Text style={styles.title}>D&E Turismo</Text>
        </View>

        <View style={styles.iconGroup}>
            {/* Notificações */}
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Notifications")}>
              <Feather name="bell" size={24} color="#282727ff" />
            </TouchableOpacity>

            {/* Salvos */}
            <TouchableOpacity style={[styles.iconButton, styles.iconSpacing]} onPress={() => navigation.navigate("SavedTrips")}>
              <Feather name="bookmark" size={24} color="#282727ff" />
            </TouchableOpacity>
          </View>
      </View>

      {/* Barra de busca */}
      <View style={styles.searchBar}>
       
        <TextInput
          placeholder="Ex: Praia, Serviços..."
          placeholderTextColor="#999"
          style={styles.input}
        />

         <Feather name="search" size={18} color="#777" style={{ marginRight: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 28,
    backgroundColor: "#FF9A00",
    borderRadius: 26
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fef6e4",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#282727ff",
  },
  searchBar: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef6e4",
    borderRadius: 28,   // metade da altura (MD3)
    paddingHorizontal: 16, // token MD3
    height: 56,
    width: "100%",      // ocupa o container
  },

  input: {
    flex: 1,
    fontSize: 14,
  },
  
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    
  },
  iconSpacing: {
    marginLeft: 0.1,
  },
});
