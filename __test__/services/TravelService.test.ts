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

    // Mock console to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    service = new TravelService();
    
    // Get the mock instances
    mockRepository = (service as any).repository;
    mockOffline = (service as any).offline;
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

    it('should return empty array if queue and remote are empty', async () => {
      mockOffline.getQueue.mockResolvedValue([]);
      mockRepository.getSavedTravels.mockResolvedValue([]);
      mockOffline.getSavedTrips.mockResolvedValue([]);

      const result = await service.listSavedTravels();

      expect(mockOffline.getQueue).toHaveBeenCalled();
      expect(mockRepository.getSavedTravels).toHaveBeenCalled();
      expect(mockOffline.setSavedTrips).not.toHaveBeenCalled();
      expect(mockOffline.getSavedTrips).toHaveBeenCalled();
      expect(result).toEqual([]);
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

    it('should unsave status on server and update cache', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      const mockEq2 = jest.fn().mockResolvedValue({ error: null });
      mockUpdate.mockReturnValue({ eq: mockEq2 });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await service.updateSavedStatus('1', false);

      expect(mockFrom).toHaveBeenCalledWith('viagem');
      expect(mockUpdate).toHaveBeenCalledWith({ salvo: false });
      expect(mockEq2).toHaveBeenCalledWith('id', '1');
      expect(mockOffline.removeSavedTripFromCache).toHaveBeenCalledWith('1');
       expect(result).toBe(true);
    });

    it('should not crash if trip not found in cache during successful server update', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      const mockEq2 = jest.fn().mockResolvedValue({ error: null });
      mockUpdate.mockReturnValue({ eq: mockEq2 });
      mockFrom.mockReturnValue({ update: mockUpdate });

      mockOffline.getCachedTrips.mockResolvedValue([]); // Empty cache

      const result = await service.updateSavedStatus('1', true);

      expect(mockOffline.cacheSavedTrip).not.toHaveBeenCalled();
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

    it('should handle exception during server call and fallback to local', async () => {
      const mockUpdate = jest.fn();
      // Simulate exception
      mockFrom.mockImplementation(() => { throw new Error('Unexpected'); });

      mockOffline.getCachedTrips.mockResolvedValue([{ id: '1', saved: false } as any]);

      const result = await service.updateSavedStatus('1', true);

      expect(mockOffline.saveTripLocally).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if trip not found in cache (cache mismatch) during local save fallback', async () => {
      const mockUpdate = jest.fn();
      const mockEq2 = jest.fn().mockResolvedValue({ error: { message: 'Network error' } });
      mockUpdate.mockReturnValue({ eq: mockEq2 });
      mockFrom.mockReturnValue({ update: mockUpdate });

      // Cache tem itens, mas não o id '1'
      mockOffline.getCachedTrips.mockResolvedValue([{ id: '2', saved: true } as any]);

      const result = await service.updateSavedStatus('1', true);

      expect(mockOffline.saveTripLocally).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

     it('should return false if local save fails', async () => {
      const mockUpdate = jest.fn();
      const mockEq2 = jest.fn().mockResolvedValue({ error: { message: 'Network error' } });
      mockUpdate.mockReturnValue({ eq: mockEq2 });
      mockFrom.mockReturnValue({ update: mockUpdate });

      mockOffline.getCachedTrips.mockResolvedValue([{ id: '1', saved: false } as any]);
      mockOffline.saveTripLocally.mockRejectedValue(new Error('Local error'));

      const result = await service.updateSavedStatus('1', true);

      expect(mockOffline.saveTripLocally).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Erro ao salvar localmente:", expect.any(Error));
      expect(result).toBe(false);
    });
  });

  describe('syncPendingChanges', () => {
    it('should do nothing if queue is empty', async () => {
      mockOffline.getQueue.mockResolvedValue([]);

      await service.syncPendingChanges();

      expect(mockOffline.getQueue).toHaveBeenCalled();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('should sync pending changes successfully', async () => {
      const queue = [
        { type: 'save', id: '1' },
        { type: 'unsave', id: '2' }
      ];
      // First call for syncPendingChanges, subsequent for listSavedTravels (should be empty after sync)
      mockOffline.getQueue
        .mockResolvedValueOnce(queue as any)
        .mockResolvedValue([]); 

      const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
      mockFrom.mockReturnValue({ update: mockUpdate });

      mockRepository.getAllTravels.mockResolvedValue([]);
      mockRepository.getSavedTravels.mockResolvedValue([]);

      await service.syncPendingChanges();

      // Should verify calling supabase for each item
      expect(mockFrom).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Sincronizando 2 alterações'));
      
      // Should clear queue or update it
      expect(mockOffline.setQueue).toHaveBeenCalledWith([]);
      
      // Should refresh lists
      expect(mockRepository.getAllTravels).toHaveBeenCalled();
      
      expect(mockRepository.getSavedTravels).toHaveBeenCalled();
    });

    it('should keep failed items in queue', async () => {
      const queue = [
        { type: 'save', id: '1' }, // Will fail
        { type: 'unsave', id: '2' } // Will success
      ];
      mockOffline.getQueue.mockResolvedValue(queue as any);

      // Mock sequence of responses
      const mockEqFail = jest.fn().mockResolvedValue({ error: { message: 'Sync fail' } });
      const mockEqSuccess = jest.fn().mockResolvedValue({ error: null });

      const mockUpdate = jest.fn();
      // Because the code reverses the queue: process '2' (unsave) then '1' (save)
      // queue reverse: [{2, unsave}, {1, save}]
      
      // First call (item 2 - unsave) -> success
      // Second call (item 1 - save) -> fail
      
      mockFrom.mockReturnValue({ 
        update: mockUpdate.mockReturnValue({
          eq: jest.fn()
            .mockReturnValueOnce(Promise.resolve({ error: null })) // item 2
            .mockReturnValueOnce(Promise.resolve({ error: { message: 'Sync fail' } })) // item 1
        })
      });

      await service.syncPendingChanges();

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Erro ao sincronizar item 1'), expect.any(Object));
      
      // Expect queue to be updated with failed items (item 1)
      // The code logic: remainingQueue.push(item) for failed items.
      // Then setQueue(remainingQueue.reverse())
      expect(mockOffline.setQueue).toHaveBeenCalledWith([{ type: 'save', id: '1' }]);
    });

    it('should not refresh lists if multiple items fail sync', async () => {
      const queue = [
        { type: 'save', id: '1' },
        { type: 'unsave', id: '2' }
      ];
      mockOffline.getQueue.mockResolvedValue(queue as any);

      // Fail both
      const mockUpdate = jest.fn().mockReturnValue({ 
        eq: jest.fn().mockResolvedValue({ error: { message: 'Fail' } }) 
      });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.syncPendingChanges();

      // remainingQueue should be equal to queue (reversed order logic kept)
      expect(mockOffline.setQueue).toHaveBeenCalled(); 
      expect(mockRepository.getAllTravels).not.toHaveBeenCalled();
    });

    it('should handle general error during sync', async () => {
      mockOffline.getQueue.mockRejectedValue(new Error('Queue error'));

      await service.syncPendingChanges();

      expect(console.error).toHaveBeenCalledWith("Erro durante sincronização:", expect.any(Error));
    });
  });
});
