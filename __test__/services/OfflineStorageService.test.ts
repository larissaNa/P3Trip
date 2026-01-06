import { OfflineStorageService } from '../../src/model/services/OfflineStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('OfflineStorageService', () => {
  let service: OfflineStorageService;

  beforeEach(() => {
    service = new OfflineStorageService();
    jest.clearAllMocks();
  });

  describe('CachedTrips', () => {
    it('should get cached trips', async () => {
      const mockTrips = [{ id: '1', title: 'Trip' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockTrips));

      const result = await service.getCachedTrips();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@p3trip/trips');
      expect(result).toEqual(mockTrips);
    });

    it('should return empty array if no cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await service.getCachedTrips();

      expect(result).toEqual([]);
    });

    it('should set cached trips', async () => {
      const mockTrips = [{ id: '1', title: 'Trip' }];
      await service.setCachedTrips(mockTrips as any);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/trips', JSON.stringify(mockTrips));
    });
  });

  describe('SavedTrips', () => {
    it('should save trip locally', async () => {
      const initialSaved = [{ id: '2', saved: true }];
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@p3trip/saved') return Promise.resolve(JSON.stringify(initialSaved));
        if (key === '@p3trip/sync') return Promise.resolve(JSON.stringify([]));
        return Promise.resolve(null);
      });

      const newTrip = { id: '1', title: 'New Trip' };
      await service.saveTripLocally(newTrip as any);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@p3trip/saved',
        expect.stringContaining('"id":"1"')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@p3trip/sync',
        expect.stringContaining('"type":"save"')
      );
    });

    it('should unsave trip locally', async () => {
      const initialSaved = [{ id: '1', saved: true }];
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@p3trip/saved') return Promise.resolve(JSON.stringify(initialSaved));
        if (key === '@p3trip/sync') return Promise.resolve(JSON.stringify([]));
        return Promise.resolve(null);
      });

      await service.unsaveTripLocally('1');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/saved', '[]');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@p3trip/sync',
        expect.stringContaining('"type":"unsave"')
      );
    });
  });
});
