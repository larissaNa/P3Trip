import { View, Text, Image } from "react-native";
import { styles } from "./styles";

export default function TravelCard({
  title,
  location,
  dateRange,
  days,
  price,
  imageUrl,
}: any) {
  return (
    <View style={styles.card}>

      {/* IMAGEM DO PACOTE */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        {/* PREÇO*/}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>R${price}</Text>
        </View>
      </View>

      {/* TÍTULO */}
      <Text style={styles.title}>{title}</Text>

      {/* LOCAL */}
      <Text style={styles.location}>📍 {location}</Text>

      {/* DATAS */}
      <Text style={styles.date}>{dateRange}</Text>

      {/* DIAS */}
      <Text style={styles.days}>{days} dias</Text>
    </View>
  );
}
