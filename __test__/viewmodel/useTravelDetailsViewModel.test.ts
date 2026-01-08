import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { useTravelDetailsViewModel } from '../../src/viewmodel/useTravelDetailsViewModel';
import { TravelService } from '../../src/model/services/TravelService';

// Mock do Service
jest.mock('../../src/model/services/TravelService');

describe('useTravelDetailsViewModel', () => {
  const mockUpdateSavedStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (TravelService as jest.Mock).mockImplementation(() => ({
      updateSavedStatus: mockUpdateSavedStatus,
    }));
  });

  it('deve inicializar isSaved com o valor da viagem', () => {
    const travel = { id: '1', title: 'Trip', saved: true };
    const { result } = renderHook(() => useTravelDetailsViewModel(travel));
    expect(result.current.isSaved).toBe(true);
  });

  it('deve alternar o estado de salvo e chamar o serviço (sucesso)', async () => {
    mockUpdateSavedStatus.mockResolvedValue(true);
    const travel = { id: '1', title: 'Trip', saved: false };
    const { result } = renderHook(() => useTravelDetailsViewModel(travel));

    await act(async () => {
      await result.current.toggleSave();
    });

    expect(result.current.isSaved).toBe(true);
    expect(mockUpdateSavedStatus).toHaveBeenCalledWith('1', true);
  });

  it('deve reverter o estado se o serviço falhar (retornar false)', async () => {
     mockUpdateSavedStatus.mockResolvedValue(false);
     const travel = { id: '1', title: 'Trip', saved: false };
     const { result } = renderHook(() => useTravelDetailsViewModel(travel));

     await act(async () => {
       await result.current.toggleSave();
     });
     
     // Deve voltar para false
     expect(result.current.isSaved).toBe(false);
  });
  
  it('deve reverter o estado se o serviço lançar erro', async () => {
     mockUpdateSavedStatus.mockRejectedValue(new Error('Falha'));
     const travel = { id: '1', title: 'Trip', saved: false };
     const { result } = renderHook(() => useTravelDetailsViewModel(travel));

     await act(async () => {
       await result.current.toggleSave();
     });

     expect(result.current.isSaved).toBe(false);
  });

  it('deve abrir o WhatsApp com a mensagem correta', () => {
    const travel = { title: 'Atalaia Praia Boa' };
    const spyOpen = jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());
    
    const { result } = renderHook(() => useTravelDetailsViewModel(travel));
    
    act(() => {
        result.current.openWhatsApp();
    });
    
    expect(spyOpen).toHaveBeenCalledWith(expect.stringContaining('https://wa.me/'));
    expect(spyOpen).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent('Atalaia Praia Boa')));
  });
});
