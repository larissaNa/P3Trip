import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { TravelService } from '../../model/services/TravelService';

export const NetworkBanner = () => {
  const netInfo = useNetInfo();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'offline' | 'online'>('offline');
  const [wasOffline, setWasOffline] = useState(false);
  const travelService = new TravelService();

  useEffect(() => {
    console.log("NetworkBanner: isConnected =", netInfo.isConnected, "type =", netInfo.type);
    
    // Se estiver offline
    if (netInfo.isConnected === false) {
      console.log("NetworkBanner: Detectado OFFLINE");
      setMessage('Você está offline');
      setType('offline');
      setVisible(true);
      setWasOffline(true);
    } 
    // Se voltar a ficar online e estava offline antes
    else if (netInfo.isConnected === true && wasOffline) {
      console.log("NetworkBanner: Detectado ONLINE (após offline)");
      setMessage('Você está online novamente. Sincronizando...');
      setType('online');
      setVisible(true);
      
      // Trigger sync
      console.log("NetworkBanner: Iniciando sincronização...");
      travelService.syncPendingChanges().then(() => {
        console.log("NetworkBanner: Sincronização concluída");
        // Opcional: Atualizar mensagem após sync
        setTimeout(() => setVisible(false), 3000);
        setWasOffline(false);
      });
    }
  }, [netInfo.isConnected]);

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { backgroundColor: type === 'offline' ? '#cc0000' : '#00cc00' }]}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
    zIndex: 9999, // Ensure it's on top
    position: "absolute",
    top: 0,
  },

  container: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  text: {
    color: "white",
    fontSize: 14,
    fontFamily: "Nunito-Bold",
  },
});