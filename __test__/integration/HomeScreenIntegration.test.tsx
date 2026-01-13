import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/view/HomeScreen';
import { supabase } from '../../src/infra/supabase/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock do componente Navbar e TravelCard 
describe('HomeScreen Integration Test', () => {
  const mockTravelData = [
    {
      id: '1',
      titulo: 'Viagem para Paris',
      descricao: 'Uma viagem incrível.',
      destino: 'Paris, França',
      preco: 5000,
      imagens: ['https://example.com/paris.jpg'],
      salvo: false,
      data_range: '10-20 Out',
      dias: 10,
      inclui: ['Hotel', 'Voo'],
    },
  ];

  beforeEach(async () => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    // Limpar o AsyncStorage para evitar vazamento de estado entre testes
    await AsyncStorage.clear();
  });

  it('deve carregar viagens do repositório e exibi-las na tela', async () => {
    // Configurar o mock do Supabase para simular uma chamada bem-sucedida
    // supabase.from('viagem').select('*')
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: mockTravelData,
        error: null,
      }),
    });

    render(<HomeScreen />);


    // Título da viagem deve aparecer na tela
    // Isso confirma: ViewModel chamou Service -> Service chamou Repository -> Repository chamou Supabase
    // -> Dados voltaram -> ViewModel atualizou estado -> View renderizou
    await waitFor(() => {
      expect(screen.getByText('Viagem para Paris')).toBeTruthy();
      expect(screen.getByText(/Paris, França/)).toBeTruthy();
    });
  });

  it('deve exibir estado de erro/vazio quando a busca falhar ou não retornar dados', async () => {
    // mock para erro
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Erro de conexão' },
      }),
    });

    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('Sem dados disponíveis')).toBeTruthy();
    });
  });
});
