import { Alert, Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from '../../infra/supabase/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

type StoredNotification = {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  data?: any;
};

const NOTIFICATION_HISTORY_KEY = '@p3trip/notifications';

export class NotificationService {
  async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
      Alert.alert(
        'Dispositivo Virtual Detectado',
        'Notificações Push não funcionam em emuladores/simuladores. Por favor, teste em um dispositivo físico.'
      );
      return null;
    }

    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permissão Negada',
        'Não foi possível obter permissão para notificações. Vá nas configurações do app e ative manualmente.'
      );
      return null;
    }

    try {
      const token = await this.getPushToken();
      await this.setupAndroidChannel();
      return token;
    } catch (error: any) {
      Alert.alert('Erro ao pegar Token', `Erro: ${error.message}`);
      console.error(error);
      return null;
    }
  }

  async registerAndSavePushToken(): Promise<string | null> {
    const token = await this.registerForPushNotificationsAsync();
    if (!token) {
      return null;
    }

    try {
      const now = new Date().toISOString();
      // Salva ou atualiza o token no Supabase
      const { error } = await supabase.from('push_tokens').upsert(
        [
          { 
            token: token,
            updated_at: now // Nome da coluna corrigido: updated_at
          }
        ],
        { onConflict: 'token' }
      );

      if (error) {
        Alert.alert("Erro ao Salvar Token", `Falha ao registrar dispositivo: ${error.message}`);
        console.error("Erro Supabase:", error);
      } else {
        // Opcional: Remover este alerta depois de validar que funcionou
        // Alert.alert("Sucesso", "Dispositivo registrado para notificações!");
      }
    } catch (error: any) {
      Alert.alert("Erro Inesperado", `Falha ao salvar token: ${error.message}`);
      console.error('Erro ao salvar push token:', error);
    }

    return token;
  }

  private async ensurePermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        "Permissão Necessária",
        "Para receber notificações de viagens, você precisa habilitar as permissões nas configurações.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir Configurações", onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }

    return true;
  }

  private async getPushToken(): Promise<string> {
    // Tenta pegar o Project ID do app.json/app.config.js se existir
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    const options: Notifications.ExpoPushTokenOptions = projectId ? { projectId } : {};
    
    const tokenData = await Notifications.getExpoPushTokenAsync(options);
    return tokenData.data;
  }

  private async setupAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  setupNotificationListeners(
    onNotification: (notification: Notifications.Notification) => void,
    onResponse: (response: Notifications.NotificationResponse) => void
  ): () => void {
    const notificationListener = Notifications.addNotificationReceivedListener(onNotification);
    const responseListener = Notifications.addNotificationResponseReceivedListener(onResponse);

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }

  async appendNotificationToHistory(notification: Notifications.Notification): Promise<void> {
    const { title, body, data } = notification.request.content;
    const safeTitle = title ?? '';
    const safeBody = body ?? '';
    const id = notification.request.identifier || String(Date.now());
    const receivedAt = new Date().toISOString();

    const stored = await this.getNotificationHistory();
    const next: StoredNotification[] = [{ id, title: safeTitle, body: safeBody, receivedAt, data }, ...stored];
    const limited = next.slice(0, 50);
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(limited));
  }

  async getNotificationHistory(): Promise<StoredNotification[]> {
    const raw = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
