import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { Linking, Dimensions } from "react-native";
import { useState } from "react";
import { TravelService } from "../model/services/TravelService";

export default function TravelDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { travel } = route.params;

  const screenWidth = Dimensions.get("window").width;
  const [isSaved, setIsSaved] = useState(travel.saved);
const service = new TravelService();

const toggleSave = async () => {
  const newStatus = !isSaved;

  // muda o ícone imediatamente
  setIsSaved(newStatus);

  // salva no supabase
  await service.updateSavedStatus(travel.id, newStatus);
};


  const openWhatsApp = () => {
    const phone = "5586998527609";
    const message = `Olá! Quero reservar o pacote: ${travel.title}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };


  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{travel.title}</Text>

        <View style={{ width: 26 }} />

      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Carrossel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carouselContainer}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          snapToInterval={screenWidth - 32 + 16}
          decelerationRate="fast"
        >
          {travel.images?.map((img: string, index: number) => {
            const isLast = index === (travel.images?.length ?? 0) - 1;
            return (
              <Image
                key={index}
                source={{ uri: img }}
                style={[
                  styles.carouselImage,
                  { width: screenWidth - 32, marginRight: isLast ? 0 : 16 },
                ]}
              />
            );
          })}
        </ScrollView>

        {/* Botão salvar abaixo da imagem */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity onPress={toggleSave}>
            {isSaved ? (
              <Ionicons name="bookmark" size={32} color="#2c83e5" />
            ) : (
              <Ionicons name="bookmark-outline" size={32} color="#333" />
            )}
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#2c83e5" />
            <Text style={styles.location}>{travel.location}</Text>
          </View>

          <View style={styles.row}>
            <MaterialIcons name="date-range" size={20} color="#2c83e5" />
            <Text style={styles.date}>{travel.dateRange}</Text>
          </View>

          <Text style={styles.price}>R$ {travel.price}</Text>

          <Text style={styles.sectionTitle}>Sobre a viagem</Text>
          <Text style={styles.description}>
            {travel.description || "Descrição breve da viagem..."}
          </Text>

          <Text style={styles.sectionTitle}>Inclui</Text>

          {[
            "Hospedagem completa",
            "Acompanhamento de guia",
            "Atividades exclusivas",
            "Seguro viagem",
          ].map((item, index) => (
            <View key={index} style={styles.highlightRow}>
              <Feather name="check-circle" size={18} color="#2c83e5" />
              <Text style={styles.highlightText}>{item}</Text>
            </View>
          ))}

        </View>
      </ScrollView>

      {/* Botão WhatsApp */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Feather name="message-circle" size={20} color="#fff" />
          <Text style={styles.whatsappText}>Entrar em contato</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDF1F5FF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: "#edf1f5ff",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#191919ff",
  },

  carouselContainer: {
    width: "100%",
    height: 180,
    
  },

  carouselImage: {
    height: 180,
    borderRadius: 26,
  },

  content: {
    padding: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  location: {
    marginLeft: 6,
    fontSize: 16,
    color: "#191919ff",
  },

  date: {
    marginLeft: 6,
    fontSize: 15,
    color: "#191919ff",
  },

  price: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "800",
    color: "#2c83e5",
  },

  sectionTitle: {
    marginTop: 22,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },

  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },

  highlightText: {
    fontSize: 15,
    color: "#444",
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#edf1f5ff",
    backgroundColor: "#edf1f5ff",
  },

  whatsappButton: {
    backgroundColor: "#25D366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 26,
    marginBottom: 20
  },

  whatsappText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  saveButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "flex-end",
    
  },
});
