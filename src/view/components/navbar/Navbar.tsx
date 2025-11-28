import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "./styles";

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
