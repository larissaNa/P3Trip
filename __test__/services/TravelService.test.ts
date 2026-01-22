import { TravelUseCases } from '../../src/usecase/travelUseCases';
import { ITravelRepository } from '../../src/model/repositories/ITravelRepository';
import { IOfflineStorageService } from '../../src/model/services/IOfflineStorageService';

describe('TravelUseCases', () => {
  let usecases: TravelUseCases;
  let mockRepository: jest.Mocked<ITravelRepository>;
  let mockOffline: jest.Mocked<IOfflineStorageService>;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();

    mockRepository = {
      getAllTravels: jest.fn(),
      getSavedTravels: jest.fn(),
      getTravelById: jest.fn(),
      saveTravel: jest.fn(),
      unsaveTravel: jest.fn(),
    };
    mockOffline = {
      getCachedTrips: jest.fn(),
      setCachedTrips: jest.fn(),
      getSavedTrips: jest.fn(),
      setSavedTrips: jest.fn(),
      saveTripLocally: jest.fn(),
      unsaveTripLocally: jest.fn(),
      cacheSavedTrip: jest.fn(),
      removeSavedTripFromCache: jest.fn(),
      getQueue: jest.fn(),
      setQueue: jest.fn(),
      enqueue: jest.fn(),
      clearQueue: jest.fn(),
    };
    usecases = new TravelUseCases(mockRepository, mockOffline);
  });

  describe('listAllTravels', () => {
    it('should return data from repository if available', async () => {
      const mockData = [{ id: '1', title: 'Trip' }];
      mockRepository.getAllTravels.mockResolvedValue(mockData as any);
      mockOffline.setCachedTrips.mockResolvedValue(undefined);

      const result = await usecases.listAllTravels();

      expect(mockRepository.getAllTravels).toHaveBeenCalled();
      expect(mockOffline.setCachedTrips).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockData);
    });

    it('should return cached data if repository is empty', async () => {
      mockRepository.getAllTravels.mockResolvedValue([]);
      const mockCache = [{ id: '1', title: 'Cached Trip' }];
      mockOffline.getCachedTrips.mockResolvedValue(mockCache as any);

      const result = await usecases.listAllTravels();

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

      const result = await usecases.listSavedTravels();

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

      const result = await usecases.listSavedTravels();

      expect(mockOffline.getQueue).toHaveBeenCalled();
      expect(mockRepository.getSavedTravels).toHaveBeenCalled();
      expect(mockOffline.setSavedTrips).toHaveBeenCalledWith(mockRemote);
      expect(result).toEqual(mockRemote);
    });
  });

  describe('updateSavedStatus', () => {
    it('should call saveTravel on repo and update cache when saved=true', async () => {
       mockRepository.saveTravel.mockResolvedValue(undefined);
       mockOffline.getCachedTrips.mockResolvedValue([{ id: '1', saved: false } as any]);

       const result = await usecases.updateSavedStatus('1', true);

       expect(mockRepository.saveTravel).toHaveBeenCalledWith('1');
       expect(mockOffline.cacheSavedTrip).toHaveBeenCalled();
       expect(result).toBe(true);
    });

    it('should call unsaveTravel on repo and remove from cache when saved=false', async () => {
      mockRepository.unsaveTravel.mockResolvedValue(undefined);

      const result = await usecases.updateSavedStatus('1', false);

      expect(mockRepository.unsaveTravel).toHaveBeenCalledWith('1');
      expect(mockOffline.removeSavedTripFromCache).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
   });

   it('should fallback to local update if repo fails', async () => {
     mockRepository.saveTravel.mockRejectedValue(new Error('Network error'));
     mockOffline.getCachedTrips.mockResolvedValue([{ id: '1', saved: false } as any]);

     const result = await usecases.updateSavedStatus('1', true);

     expect(mockRepository.saveTravel).toHaveBeenCalledWith('1');
     expect(mockOffline.saveTripLocally).toHaveBeenCalled(); // Should fallback
     expect(result).toBe(true);
   });
  });

  describe('syncPendingChanges', () => {
    it('should process queue items', async () => {
      mockOffline.getQueue.mockResolvedValue([{ type: 'save', id: '1' }, { type: 'unsave', id: '2' }]);
      mockRepository.saveTravel.mockResolvedValue(undefined);
      mockRepository.unsaveTravel.mockResolvedValue(undefined);
      mockOffline.setQueue.mockResolvedValue(undefined);

      await usecases.syncPendingChanges();

      expect(mockRepository.saveTravel).toHaveBeenCalledWith('1');
      expect(mockRepository.unsaveTravel).toHaveBeenCalledWith('2');
      expect(mockOffline.setQueue).toHaveBeenCalledWith([]);
    });

    it('should keep failed items in queue', async () => {
      mockOffline.getQueue.mockResolvedValue([{ type: 'save', id: '1' }]);
      mockRepository.saveTravel.mockRejectedValue(new Error('Fail'));

      await usecases.syncPendingChanges();

      expect(mockRepository.saveTravel).toHaveBeenCalledWith('1');
      // The implementation reverses queue logic, so we just expect it to be set back
      expect(mockOffline.setQueue).toHaveBeenCalledWith([{ type: 'save', id: '1' }]);
    });
  });
});
