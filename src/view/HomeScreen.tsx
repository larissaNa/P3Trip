import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions, LayoutChangeEvent, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "./components/navbar/Navbar";
import TravelCard from "./components/cards/TravelCard";
import { HomeViewModel } from "../viewmodel/useHomeViewModel";
import { useState, useRef } from "react";

export default function HomeScreen() {
  const vm = HomeViewModel();
  const navigation = useNavigation<any>();
  const [navbarHeight, setNavbarHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const onNavbarLayout = (event: LayoutChangeEvent) => {
    setNavbarHeight(event.nativeEvent.layout.height);
  };

  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false, 
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 300 && !showScrollTop) {
          setShowScrollTop(true);
        } else if (offsetY <= 300 && showScrollTop) {
          setShowScrollTop(false);
        }
      },
    }
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#a7c9ffff" }}>
      <Animated.ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
      >
        {/* Navbar animada para ficar fixa no topo */}
        <Animated.View 
          style={{ 
            position: "absolute", 
            top: 0, left: 0, right: 0, zIndex: 0,
            transform: [{ translateY: scrollY }]
          }}
          onLayout={onNavbarLayout}
        >
          <Navbar onSearch={vm.search} />
        </Animated.View>

        {/* Conteúdo com marginTop para iniciar abaixo da Navbar */}
        <View style={{ 
          marginTop: navbarHeight,
          backgroundColor: "#edf1f5ff", 
          minHeight: Dimensions.get("window").height,
          paddingBottom: 30, 
          zIndex: 1,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          // Sombra para dar profundidade sobre a navbar
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 10,
        }}>
          {vm.loading ? (
            <ActivityIndicator size="large" color="#2c83e5" style={{ marginTop: 40 }} />
          ) : vm.travelData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={60} color="#777" />
              <Text style={styles.emptyTitle}>Sem dados disponíveis</Text>
              <Text style={styles.emptySubtitle}>
                Conexão indisponível ou nenhum conteúdo em cache. Tente novamente.
              </Text>
              <TouchableOpacity onPress={vm.reload} style={styles.button}>
                <Text style={styles.buttonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 16, paddingTop: 24 }}>
              {vm.travelData.map((item) => (
                <TravelCard
                  key={item.id}
                  {...item}
                  onPress={() => navigation.navigate("TravelDetails", { travel: item })}
                />
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Botão Flutuante (FAB) */}
      {showScrollTop && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={handleScrollToTop}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-up" size={24} color="#2052b1ff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 40, 
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  emptySubtitle: {
    marginTop: 6,
    textAlign: "center",
    color: "#777",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2c83e5",
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 26,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  fab: {
    position: 'absolute',
    bottom: 82,
    right: 30,
    backgroundColor: '#a7c9ffff',
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  }
});
