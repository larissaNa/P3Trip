import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function TravelCard({ title, location, dateRange, days, price, imageUrl, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>R${price}</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.location}>📍 {location}</Text>
      <Text style={styles.date}>{dateRange}</Text>
      <Text style={styles.days}>{days} dias</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
