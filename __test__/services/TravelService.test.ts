import { TravelService } from '../../src/model/services/TravelService';
import { TravelRepository } from '../../src/model/repositories/TravelRepository';
import { OfflineStorageService } from '../../src/model/services/OfflineStorageService';
import { supabase } from '../../src/infra/supabase/supabase';

jest.mock('../../src/infra/supabase/supabase');
jest.mock('../../src/model/repositories/TravelRepository');
jest.mock('../../src/model/services/OfflineStorageService');

describe('TravelService', () => {
  let service: TravelService;
  let mockRepository: jest.Mocked<TravelRepository>;
  let mockOffline: jest.Mocked<OfflineStorageService>;
  const mockFrom = supabase.from as jest.Mock;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (TravelRepository as jest.Mock).mockClear();
    (OfflineStorageService as jest.Mock).mockClear();
    jest.clearAllMocks();

    service = new TravelService();
    
    // Get the mock instances
    mockRepository = (service as any).repository;
    mockOffline = (service as any).offline;
  });

  describe('listAllTravels', () => {
    it('should return data from repository if available', async () => {
      const mockData = [{ id: '1', title: 'Trip' }];
      mockRepository.getAllTravels.mockResolvedValue(mockData as any);
      mockOffline.setCachedTrips.mockResolvedValue(undefined);

      const result = await service.listAllTravels();

      expect(mockRepository.getAllTravels).toHaveBeenCalled();
      expect(mockOffline.setCachedTrips).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockData);
    });

    it('should return cached data if repository is empty', async () => {
      mockRepository.getAllTravels.mockResolvedValue([]);
      const mockCache = [{ id: '1', title: 'Cached Trip' }];
      mockOffline.getCachedTrips.mockResolvedValue(mockCache as any);

      const result = await service.listAllTravels();

      expect(mockRepository.getAllTravels).toHaveBeenCalled();
      expect(mockOffline.getCachedTrips).toHaveBeenCalled();
      expect(result).toEqual(mockCache);
    });
  });

  describe('listSavedTravels', () => {
    it('should return local saved trips if queue has items', async () => {
      mockOffline.getQueue.mockResolvedValue([{ type: 'save', id: '1' }]);
      const mockSaved = [{ id: '1', saved: true }];
      mockOffline.getSavedTrips.mockResolvedValue(mockSaved as any);

      const result = await service.listSavedTravels();

      expect(mockOffline.getQueue).toHaveBeenCalled();
      expect(mockOffline.getSavedTrips).toHaveBeenCalled();
      expect(mockRepository.getSavedTravels).not.toHaveBeenCalled();
      expect(result).toEqual(mockSaved);
    });

    it('should return remote saved trips if queue is empty', async () => {
      mockOffline.getQueue.mockResolvedValue([]);
      const mockRemote = [{ id: '2', saved: true }];
      mockRepository.getSavedTravels.mockResolvedValue(mockRemote as any);
      mockOffline.setSavedTrips.mockResolvedValue(undefined);

      const result = await service.listSavedTravels();

      expect(mockOffline.getQueue).toHaveBeenCalled();
      expect(mockRepository.getSavedTravels).toHaveBeenCalled();
      expect(mockOffline.setSavedTrips).toHaveBeenCalledWith(mockRemote);
      expect(result).toEqual(mockRemote);
    });
  });

  describe('updateSavedStatus', () => {
    it('should update status on server and update cache', async () => {
       const mockUpdate = jest.fn().mockResolvedValue({ error: null });
       
       const mockEq2 = jest.fn().mockResolvedValue({ error: null });
       mockUpdate.mockReturnValue({ eq: mockEq2 });
       mockFrom.mockReturnValue({ update: mockUpdate });

       mockOffline.getCachedTrips.mockResolvedValue([{ id: '1', saved: false } as any]);

       const result = await service.updateSavedStatus('1', true);

       expect(mockFrom).toHaveBeenCalledWith('viagem');
       expect(mockUpdate).toHaveBeenCalledWith({ salvo: true });
       expect(mockEq2).toHaveBeenCalledWith('id', '1');
       expect(mockOffline.cacheSavedTrip).toHaveBeenCalled();
       expect(result).toBe(true);
    });

    it('should save locally on server error', async () => {
       const mockUpdate = jest.fn();
       const mockEq2 = jest.fn().mockResolvedValue({ error: { message: 'Network error' } });
       mockUpdate.mockReturnValue({ eq: mockEq2 });
       mockFrom.mockReturnValue({ update: mockUpdate });

       mockOffline.getCachedTrips.mockResolvedValue([{ id: '1', saved: false } as any]);

       const result = await service.updateSavedStatus('1', true);

       expect(mockOffline.saveTripLocally).toHaveBeenCalled();
       expect(result).toBe(true);
    });

    it('should unsave locally on server error', async () => {
      const mockUpdate = jest.fn();
      const mockEq2 = jest.fn().mockResolvedValue({ error: { message: 'Network error' } });
      mockUpdate.mockReturnValue({ eq: mockEq2 });
      mockFrom.mockReturnValue({ update: mockUpdate });

      mockOffline.getCachedTrips.mockResolvedValue([{ id: '1', saved: true } as any]);

      const result = await service.updateSavedStatus('1', false);

      expect(mockOffline.unsaveTripLocally).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
   });

   it('should remove from cache on server success (unsave)', async () => {
    const mockUpdate = jest.fn().mockResolvedValue({ error: null });
    const mockEq2 = jest.fn().mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq2 });
    mockFrom.mockReturnValue({ update: mockUpdate });

    mockOffline.getCachedTrips.mockResolvedValue([{ id: '1', saved: true } as any]);

    const result = await service.updateSavedStatus('1', false);

    expect(mockOffline.removeSavedTripFromCache).toHaveBeenCalledWith('1');
    expect(result).toBe(true);
  });
  });

  describe('syncPendingChanges', () => {
    it('should do nothing if queue is empty', async () => {
      mockOffline.getQueue.mockResolvedValue([]);
      await service.syncPendingChanges();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('should sync items and clear queue on success', async () => {
      mockOffline.getQueue
        .mockResolvedValueOnce([
          { type: 'save', id: '1' },
          { type: 'unsave', id: '2' }
        ])
        .mockResolvedValue([]); // Subsequent calls return empty

      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      // Mock repository calls that happen after sync
      mockRepository.getAllTravels.mockResolvedValue([]);
      mockRepository.getSavedTravels.mockResolvedValue([]);

      await service.syncPendingChanges();

      expect(mockFrom).toHaveBeenCalledTimes(2);
      expect(mockOffline.setQueue).toHaveBeenCalledWith([]);
      // Should refresh lists
      expect(mockRepository.getAllTravels).toHaveBeenCalled();
      expect(mockRepository.getSavedTravels).toHaveBeenCalled();
    });

    it('should keep failed items in queue', async () => {
      mockOffline.getQueue.mockResolvedValue([
        { type: 'save', id: '1' }
      ]);

      const mockUpdate = jest.fn().mockResolvedValue({ error: { message: 'Error' } });
      const mockEq = jest.fn().mockResolvedValue({ error: { message: 'Error' } });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.syncPendingChanges();

      expect(mockOffline.setQueue).toHaveBeenCalledWith([{ type: 'save', id: '1' }]);
    });
  });
});
