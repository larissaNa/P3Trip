import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
