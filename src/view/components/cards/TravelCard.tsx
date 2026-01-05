import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface TravelCardProps {
  title: string;
  destination: string;
  dateRange: string;
  days: number;
  price: number;
  images: string[];
  onPress: () => void;
}

export default function TravelCard({
  title,
  destination,
  dateRange,
  days,
  price,
  images,
  onPress,
}: TravelCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* IMAGEM */}
      {images?.length > 0 && (
        <Image source={{ uri: images[0] }} style={styles.image} />
      )}

      {/* TEXTOS */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.location}>
          <Ionicons name="location-sharp" size={14} color="#555" /> {destination}
        </Text>

        {/* LINHA DA DATA + DIAS */}
        <View style={styles.row}>
          <Text style={styles.date}>
            <MaterialIcons name="date-range" size={16} color="#666" /> {dateRange}
          </Text>
          <Text style={styles.days}>{days} dias</Text>
        </View>

        {/* PREÇO */}
        <Text style={styles.price}>R$ {price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  days: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2c83e5",
    marginTop: 4,
  },
});
