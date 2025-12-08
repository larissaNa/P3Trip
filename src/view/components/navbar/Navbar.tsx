import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function Navbar() {
  return (
    <View style={styles.headerContainer}>
      {/* Linha superior */}
      <View style={styles.row}>
        {/* Logo */}
        <View style={styles.logo} />
        <View>
          <Text style={styles.title}>D&E Turismo</Text>
        </View>

      <View style={styles.row}>
        <TouchableOpacity>
          <Feather name="bell" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="bookmark" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      </View>

      {/* Barra de busca */}
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color="#777" style={{ marginRight: 4 }} />
        <TextInput
          placeholder="Ex: Praia, Serviços..."
          placeholderTextColor="#999"
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  logo: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#e3e3e3",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 10,
  },

  subtitle: {
    marginLeft: 10,
    color: "#808080",
  },

  icon: {
    width: 24,
    height: 24,
    tintColor: "#333",
  },

  searchBar: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ececec",
    borderRadius: 30,
    paddingHorizontal: 12,
    height: 40,
  },

  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: "#777",
  },

  input: {
    flex: 1,
    fontSize: 14,
  },
});
