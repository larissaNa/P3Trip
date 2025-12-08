import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function TravelDetailsScreen() {
  const route = useRoute<any>();
  const { travel } = route.params;

  const openWhatsApp = () => {
    const phone = "5511999999999"; // substitua pelo seu número
    const message = `Olá! Quero reservar o pacote: ${travel.title}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Carrossel de imagens */}
      <ScrollView horizontal pagingEnabled style={styles.carousel}>
        <Image source={{ uri: travel.imageUrl }} style={styles.image} />
        {/* Se tiver mais imagens, faça um array travel.images.map */}
      </ScrollView>

      <View style={styles.content}>
        <Text style={styles.title}>{travel.title}</Text>
        <Text style={styles.destination}>📍 {travel.location}</Text>
        <Text style={styles.description}>{travel.description || "Descrição do pacote não disponível."}</Text>
        <Text style={styles.price}>R${travel.price}</Text>

        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Text style={styles.whatsappText}>Entrar em contato</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  carousel: { height: 250 },
  image: { width: 350, height: 250, marginRight: 10, borderRadius: 15 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  destination: { fontSize: 16, color: "#777", marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 12 },
  price: { fontSize: 18, fontWeight: "600", color: "#2c83e5", marginBottom: 20 },
  whatsappButton: { backgroundColor: "#25D366", padding: 16, borderRadius: 10, alignItems: "center" },
  whatsappText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
