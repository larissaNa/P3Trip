import { renderHook, waitFor, act } from '@testing-library/react-native';
import { HomeViewModel } from '../../src/viewmodel/useHomeViewModel';
import { TravelService } from '../../src/model/services/TravelService';

// Mock do Service
jest.mock('../../src/model/services/TravelService');

// Mock do React Navigation
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback: any) => {
      React.useEffect(callback, []);
    },
  };
});

describe('HomeViewModel', () => {
  const mockTravels = [
    { 
      id: '1', 
      title: 'Praia de Atalaia', 
      destination: 'Aracaju', 
      price: 5000, 
      saved: false, 
      images: [], 
      dateRange: '', 
      days: 5,
      description: 'Descrição Atalaia' 
    },
    { 
      id: '2', 
      title: 'Praia do Coqueiro', 
      destination: 'Piauí', 
      price: 4000, 
      saved: true, 
      images: [], 
      dateRange: '', 
      days: 4,
      description: 'Descrição Coqueiro'
    },
    { 
      id: '3', 
      title: 'Serra da Capivara', 
      destination: 'Piauí', 
      price: 2000, 
      saved: false, 
      images: [], 
      dateRange: '', 
      days: 7,
      description: 'Descrição Serra'
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (TravelService as jest.Mock).mockImplementation(() => ({
      listAllTravels: jest.fn().mockResolvedValue(mockTravels),
    }));
  });

  it('deve filtrar viagens por termo comum (ex: "praia")', async () => {
    const { result } = renderHook(() => HomeViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.travelData).toHaveLength(3);

    // Pesquisar por "praia" -> Deve retornar Atalaia e Coqueiro
    await act(async () => {
      
      result.current.search('praia');
    });

    expect(result.current.travelData).toHaveLength(2);
    expect(result.current.travelData[0].title).toBe('Praia de Atalaia');
    expect(result.current.travelData[1].title).toBe('Praia do Coqueiro');
  });

  it('deve retornar todas as viagens quando a busca for vazia', async () => {
    const { result } = renderHook(() => HomeViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Filtrar algo primeiro
    await act(async () => {
      result.current.search('Coqueiro');
    });

    // Limpar busca
    await act(async () => {
      result.current.search('');
    });

    expect(result.current.travelData).toHaveLength(3);
  });
});


