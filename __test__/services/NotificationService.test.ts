import { NotificationService } from '../../src/model/services/NotificationService';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Mock das bibliotecas do Expo
jest.mock('expo-notifications');
jest.mock('expo-device');

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
  });

  describe('registerForPushNotificationsAsync', () => {
    it('deve retornar null se não for um dispositivo físico', async () => {
      (Device.isDevice as any) = false;
      
      const token = await service.registerForPushNotificationsAsync();
      
      expect(token).toBeNull();
    });

    it('deve solicitar permissão se ainda não foi concedida e retornar token se aprovado', async () => {
      (Device.isDevice as any) = true;
      Platform.OS = 'android';

      // Mock status inicial: indeterminado
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      // Mock solicitação: concedida
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      // Mock obtenção do token
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'expo-push-token-123',
      });

      const token = await service.registerForPushNotificationsAsync();

      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
      expect(token).toBe('expo-push-token-123');
    });

    it('deve retornar null se a permissão for negada', async () => {
      (Device.isDevice as any) = true;

      // Mock status: negado
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      // Mock solicitação: também negada (usuário recusou)
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const token = await service.registerForPushNotificationsAsync();

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(token).toBeNull();
    });

    it('deve configurar canal de notificação no Android', async () => {
      (Device.isDevice as any) = true;
      Platform.OS = 'android';
      
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'token' });

      await service.registerForPushNotificationsAsync();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.objectContaining({
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      }));
    });

    it('não deve configurar canal de notificação se não for Android', async () => {
      (Device.isDevice as any) = true;
      Platform.OS = 'ios';
      
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'token' });

      await service.registerForPushNotificationsAsync();

      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });
  });

  describe('Listeners', () => {
    it('deve adicionar listeners de notificação', () => {
      const mockNotificationListener = { remove: jest.fn() };
      const mockResponseListener = { remove: jest.fn() };

      (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue(mockNotificationListener);
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue(mockResponseListener);

      const cleanup = service.setupNotificationListeners(
        jest.fn(), // onNotification
        jest.fn()  // onResponse
      );

      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
      
      // Testar cleanup
      cleanup();
      expect(mockNotificationListener.remove).toHaveBeenCalled();
      expect(mockResponseListener.remove).toHaveBeenCalled();
    });
  });
});
