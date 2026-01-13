import { TravelRepository } from '../../src/model/repositories/TravelRepository';
import { supabase } from '../../src/infra/supabase/supabase';

// Mock do supabase
jest.mock('../../src/infra/supabase/supabase');

describe('TravelRepository', () => {
  let repository: TravelRepository;
  const mockFrom = supabase.from as jest.Mock;

  beforeEach(() => {
    repository = new TravelRepository();
    jest.clearAllMocks();
  });

  describe('getAllTravels', () => {
    it('should return a list of travels when supabase returns data', async () => {
      const mockData = [
        {
          id: '1',
          titulo: 'Paris',
          descricao: 'Cidade Luz',
          destino: 'França',
          preco: 1000,
          imagens: ['img1.jpg'],
          salvo: false,
          data_range: '10-20 Jan',
          dias: 10,
          inclui: ['Aéreo', 'Hotel'],
        },
      ];

      const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await repository.getAllTravels();

      expect(mockFrom).toHaveBeenCalledWith('viagem');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Paris');
      expect(result[0].inclui).toEqual(['Aéreo', 'Hotel']);
    });

    it('should map defaults when optional fields are missing', async () => {
      const mockData = [
        {
          id: '2',
          titulo: 'Lisboa',
          descricao: 'Capital',
          destino: 'Portugal',
          preco: 800,
          // salvo ausente
          data_range: '01-05 Mar',
          dias: 5
          // imagens e inclui ausentes
        },
      ];

      const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await repository.getAllTravels();

      expect(result[0].images).toEqual([]);
      expect(result[0].inclui).toEqual([]);
      expect(result[0].saved).toBe(false);
    });

    it('should log error when NODE_ENV is not test', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockSelect = jest.fn().mockResolvedValue({ data: null, error: { message: 'Error' } });
      mockFrom.mockReturnValue({ select: mockSelect });

      await repository.getAllTravels();

      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar viagens:', { message: 'Error' });

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it('should return empty array on error', async () => {
      const mockSelect = jest.fn().mockResolvedValue({ data: null, error: { message: 'Error' } });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await repository.getAllTravels();

      expect(result).toEqual([]);
    });
  });

  describe('getSavedTravels', () => {
    it('should return saved travels', async () => {
      const mockData = [
        {
          id: '2',
          titulo: 'Tokyo',
          salvo: true,
        },
      ];

      const mockEq = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await repository.getSavedTravels();

      expect(mockFrom).toHaveBeenCalledWith('viagem');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('salvo', true);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Tokyo');
    });

    it('should return empty array on error', async () => {
        const mockEq = jest.fn().mockResolvedValue({ data: null, error: { message: 'Error' } });
        const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
        mockFrom.mockReturnValue({ select: mockSelect });

        const result = await repository.getSavedTravels();

        expect(result).toEqual([]);
      });
    
    it('should map defaults when imagens missing in saved travels', async () => {
      const mockData = [
        {
          id: '3',
          titulo: 'Roma',
          salvo: true
          // imagens ausente
        },
      ];
      const mockEq = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await repository.getSavedTravels();
      expect(result[0].images).toEqual([]);
    });
  });
});
