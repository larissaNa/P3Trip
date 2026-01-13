import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import SavedTripsScreen from '../../src/view/SavedTripsScreen';
import { supabase } from '../../src/infra/supabase/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('SavedTripsScreen Integration Test', () => {
  const mockSavedTravel = {
    id: '2',
    titulo: 'Viagem Salva Exemplo',
    descricao: 'Desc',
    destino: 'Salvador, Bahia',
    preco: 3000,
    imagens: [],
    salvo: true,
    data_range: '01-05 Jan',
    dias: 5,
    inclui: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('deve exibir viagens salvas vindas do servidor', async () => {
    // Mock Supabase 
    // Supabase.from('viagem').select('*').eq('salvo', true)
    
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: [mockSavedTravel],
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    // O mockEq precisa ser o retorno de .select('*')
    mockSelect.mockReturnValue({ eq: mockEq });

    const navigationMock = { navigate: jest.fn(), goBack: jest.fn() };
    
    render(<SavedTripsScreen navigation={navigationMock} />);

    await waitFor(() => {
      expect(screen.getByText('Viagens Salvas')).toBeTruthy();
      expect(screen.getByText('Viagem Salva Exemplo')).toBeTruthy();
      expect(screen.getByText(/Salvador, Bahia/)).toBeTruthy();
    });
  });

  it('deve exibir mensagem de lista vazia quando não houver salvos', async () => {
    // Mock Supabase vazio
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({ eq: mockEq });

    const navigationMock = { navigate: jest.fn(), goBack: jest.fn() };

    render(<SavedTripsScreen navigation={navigationMock} />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma viagem salva')).toBeTruthy();
    });
  });
});
