import { OfflineStorageService } from '../../src/model/services/OfflineStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('OfflineStorageService', () => {
  let service: OfflineStorageService;

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new OfflineStorageService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

    it('should not add to save list if already exists during local save', async () => {
      const existingTrip = { id: '1', title: 'Trip', saved: true };
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@p3trip/saved') return Promise.resolve(JSON.stringify([existingTrip]));
        if (key === '@p3trip/sync') return Promise.resolve(JSON.stringify([]));
        return Promise.resolve(null);
      });

      await service.saveTripLocally(existingTrip as any);

      // Should verify setSavedTrips is called with same list (re-saved essentially, or logic might just keep it)
      // Code: const next = exists ? list : [{ ...travel, saved: true }, ...list];
      // So if exists, it saves 'list' again.
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/saved', JSON.stringify([existingTrip]));
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

    it('should log error if saveTripLocally fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage fail'));

      await service.saveTripLocally({ id: '1' } as any);

      expect(consoleErrorSpy).toHaveBeenCalledWith("OfflineStorage: Erro ao salvar viagem localmente", expect.any(Error));
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
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([{ id: '1', saved: true }, { id: '2', saved: true }]));

      await service.removeSavedTripFromCache('1');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/saved', expect.stringContaining('"id":"2"'));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/saved', expect.not.stringContaining('"id":"1"'));
    });
    it('should return empty array if getSavedTrips returns null', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        const result = await service.getSavedTrips();
        expect(result).toEqual([]);
    });
  });

  describe('Queue', () => {
    it('should get queue returning empty array if null', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await service.getQueue();
      expect(result).toEqual([]);
    });

    it('should get queue returning items', async () => {
      const queue = [{ type: 'save', id: '1' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(queue));
      const result = await service.getQueue();
      expect(result).toEqual(queue);
    });

    it('should clear queue', async () => {
      await service.clearQueue();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@p3trip/sync', '[]');
    });
  });
});
