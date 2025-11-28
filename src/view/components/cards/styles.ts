import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 24,
  },

  imageWrapper: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  priceTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ff8c28",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  priceText: {
    color: "#fff",
    fontWeight: "bold",
  },

  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 10,
  },

  location: {
    marginTop: 4,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#777",
  },

  date: {
    marginTop: 4,
    paddingHorizontal: 10,
    color: "#777",
  },

  days: {
    marginTop: 4,
    paddingHorizontal: 10,
    marginBottom: 12,
    fontWeight: "600",
    color: "#2c83e5",
  },
});
