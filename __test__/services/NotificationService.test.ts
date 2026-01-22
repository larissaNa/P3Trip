import { getNotificationService } from '../../src/di/container';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('../../src/infra/supabase/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    }),
  },
}));
jest.mock('../../src/di/container', () => {
  const actual = jest.requireActual('../../src/di/container');
  return {
    ...actual,
    getNotificationService: () => actual.getNotificationService(),
  };
});

describe('NotificationService', () => {
  const service = getNotificationService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('setupListeners retorna função de cleanup', () => {
    const mockNotificationListener = { remove: jest.fn() };
    const mockResponseListener = { remove: jest.fn() };
    (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue(mockNotificationListener);
    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue(mockResponseListener);
    const cleanup = service.setupListeners(jest.fn(), jest.fn());
    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    cleanup();
    expect(mockNotificationListener.remove).toHaveBeenCalled();
    expect(mockResponseListener.remove).toHaveBeenCalled();
  });

  it('registerAndSavePushToken solicita permissões e obtém token', async () => {
    (Device.isDevice as any) = true;
    Platform.OS = 'android';
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'expo-push-token-123' });
    const token = await service.registerAndSavePushToken();
    expect(token).toBe('expo-push-token-123');
  });
});
