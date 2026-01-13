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

    it('should handle error when saving locally', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage Error'));
      await service.saveTripLocally({ id: '1' } as any);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should return empty array when getSavedTrips has no cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@p3trip/saved') return Promise.resolve(null);
        return Promise.resolve(null);
      });
      const result = await service.getSavedTrips();
      expect(result).toEqual([]);
    });

    it('should cache saved trip if not exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      await service.cacheSavedTrip({ id: '1' } as any);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/saved', expect.stringContaining('"id":"1"'));
    });

    it('should not duplicate cached saved trip', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([{ id: '1', saved: true }]));
      await service.cacheSavedTrip({ id: '1' } as any);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should remove saved trip from cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([{ id: '1', saved: true }]));
      await service.removeSavedTripFromCache('1');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/saved', '[]');
    });
  });

  describe('Queue', () => {
    it('should enqueue item', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      await service.enqueue({ type: 'save', id: '1' });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/sync', expect.stringContaining('"id":"1"'));
    });

    it('should clear queue', async () => {
      await service.clearQueue();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/sync', '[]');
    });

    it('should return empty queue when no cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await service.getQueue();
      expect(result).toEqual([]);
    });
  });
});
