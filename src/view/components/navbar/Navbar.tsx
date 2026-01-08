import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
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

        <View style={styles.titleContainer} pointerEvents="none">
          <Text style={styles.title}>D&E Turismo</Text>
        </View>

        <View style={styles.iconGroup}>
          {/* Notificações */}
          <Pressable
            onPress={() => navigation.navigate("Notifications")}
            style={({ pressed }) => [
              styles.iconsButton,
              pressed && styles.pressedBackground,
            ]}
          >
            <Feather name="bell" size={24} color="#282727ff" />
          </Pressable>

          {/* Salvos */}
          <Pressable
            onPress={() => navigation.navigate("SavedTrips")}
            style={({ pressed }) => [
              styles.iconsButton,
              styles.iconSpacing,
              pressed && styles.pressedBackground,
            ]}
          >
            <Feather name="bookmark" size={24} color="#282727ff" />
          </Pressable>
        </View>
      </View>

      {/* Barra de busca */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Ex: Praia, Serviços..."
          placeholderTextColor="#999"
          style={styles.input}
        />

        <Feather
          name="search"
          size={18}
          color="#777"
          style={{ marginRight: 8 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 28,
    backgroundColor: "#a7c9ffff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    position: "relative",
  },
  logo: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    marginLeft: 2,
    backgroundColor: "#fbfcffff",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#282727ff",
  },
  searchBar: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbfcffff",
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 56,
    width: "100%",
  },

  input: {
    flex: 1,
    fontSize: 14,
  },

  iconsButton: {
    width: 42,
    height: 50,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  pressedBackground: {
    backgroundColor: "rgba(115, 128, 184, 0.12)",
  },

  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSpacing: {
    marginLeft: 1,
  },
});