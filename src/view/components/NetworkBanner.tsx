import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Animated } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { Feather } from '@expo/vector-icons';
import { TravelService } from '../../model/services/TravelService';

export const NetworkBanner = () => {
  const netInfo = useNetInfo();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'offline' | 'online'>('offline');
  const [wasOffline, setWasOffline] = useState(false);
  const travelService = new TravelService();

  // Animação para expandir/colapsar o texto
  const expandAnim = useRef(new Animated.Value(0)).current; 

  const animatedTextStyle = {
    maxWidth: expandAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 300] // Largura suficiente para o texto
    }),
    opacity: expandAnim,
    marginLeft: expandAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8]
    }),
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    console.log("NetworkBanner: isConnected =", netInfo.isConnected, "type =", netInfo.type);
    
    // Se estiver offline
    if (netInfo.isConnected === false) {
      console.log("NetworkBanner: Detectado OFFLINE");
      setMessage('Você está offline');
      setType('offline');
      setVisible(true);
      setWasOffline(true);
      
      // Mostrar texto
      expandAnim.setValue(1);

      // Colapsar para ícone após 3 segundos
      timeout = setTimeout(() => {
        Animated.timing(expandAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }).start();
      }, 3000);

    } 
    // Se voltar a ficar online e estava offline antes
    else if (netInfo.isConnected === true && wasOffline) {
      console.log("NetworkBanner: Detectado ONLINE (após offline)");
      setMessage('Você está online novamente.');
      setType('online');
      setVisible(true);
      
      // Mostrar texto
      expandAnim.setValue(1);
      
      // Trigger sync
      console.log("NetworkBanner: Iniciando sincronização...");
      travelService.syncPendingChanges().then(() => {
        console.log("NetworkBanner: Sincronização concluída");
        setWasOffline(false);
        
        // Colapsar após sincronização e breve delay
        timeout = setTimeout(() => {
            Animated.timing(expandAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false,
            }).start(() => {
                 // Opcional: Esconder totalmente após ficar um tempo só com o ícone verde
                 setTimeout(() => setVisible(false), 2000);
            });
        }, 2000);
      });
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [netInfo.isConnected]);

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
      <View style={[
        styles.container, 
        { backgroundColor: type === 'offline' ? '#ef5350' : '#66bb6a' }
      ]}>
        <Feather name={type === 'offline' ? "wifi-off" : "wifi"} size={18} color="#fff" />
        <Animated.Text style={[styles.text, animatedTextStyle]} numberOfLines={1}>
          {message}
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    zIndex: 9999,
    position: 'absolute',
    top: Platform.OS === 'android' ? 35 : 10,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    
    // Sombra suave e layout flutuante
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  text: {
    color: 'white',
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    // marginLeft removido daqui pois agora é animado
  }
});
