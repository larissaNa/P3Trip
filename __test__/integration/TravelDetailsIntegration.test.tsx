import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TravelDetailsScreen from '../../src/view/TravelDetailsScreen';
import { supabase } from '../../src/infra/supabase/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

// Mock do Supabase
describe('TravelDetailsScreen Integration Flow', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();

    // Configurar parâmetros da rota específicos para este teste
    (useRoute as jest.Mock).mockReturnValue({
      params: {
        travel: {
          id: 1,
          title: 'Paris Trip',
          destination: 'Paris',
          dateRange: '01 Dez - 05 Dez',
          price: 5000,
          description: 'Viagem romântica',
          images: ['https://example.com/paris.jpg'],
        },
      },
    });
  });

  it('deve renderizar os detalhes da viagem recebidos via rota', async () => {
    const { getByText } = render(<TravelDetailsScreen />);

    expect(getByText('Paris Trip')).toBeTruthy();
    expect(getByText('Paris')).toBeTruthy();
    expect(getByText('01 Dez - 05 Dez')).toBeTruthy();
  });

  it('deve alternar status de salvo ao clicar no botão de favorito (View -> ViewModel -> Service -> Repository -> Supabase)', async () => {
    // Configurar Mock do Supabase para sucesso na atualização
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: [{}],
      error: null,
    });
    
    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
      select: jest.fn().mockReturnThis(), // caso chame select
    });
    mockUpdate.mockReturnValue({ eq: mockEq });

    const { getByText } = render(<TravelDetailsScreen />);
    const saveButton = getByText(/Icon: bookmark/); 

    fireEvent.press(saveButton);

    await waitFor(() => {
      // Verifica se o Supabase foi chamado corretamente
      // service.updateSavedStatus chama: supabase.from('viagem').update({ salvo: true }).eq('id', 1)
      expect(supabase.from).toHaveBeenCalledWith('viagem');
      expect(mockUpdate).toHaveBeenCalledWith({ salvo: true });
      expect(mockEq).toHaveBeenCalledWith('id', 1);
    });
  });
});