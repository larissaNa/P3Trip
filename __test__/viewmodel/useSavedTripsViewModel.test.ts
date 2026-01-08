import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useSavedTripsViewModel } from "../../src/viewmodel/useSavedTripsViewModel";
import { TravelService } from "../../src/model/services/TravelService";

jest.mock("@react-navigation/native", () => {
  const React = require("react");
  return {
    useFocusEffect: (cb: any) => {
      React.useEffect(() => cb(), [cb]);
    },
  };
});

// Mock do Service
jest.mock("../../src/model/services/TravelService");

describe("useSavedTripsViewModel", () => {
  const mockListSavedTravels = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (TravelService as jest.Mock).mockImplementation(() => ({
      listSavedTravels: mockListSavedTravels,
    }));
  });

  it("carrega viagens salvas no foco com sucesso", async () => {
    const mockSaved = [{ id: "1", title: "Saved", saved: true }];
    mockListSavedTravels.mockResolvedValueOnce(mockSaved);

    const { result } = renderHook(() => useSavedTripsViewModel());

    expect(result.current.loading).toBe(true);
    expect(result.current.savedTrips).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockListSavedTravels).toHaveBeenCalledTimes(1);
    expect(result.current.savedTrips).toEqual(mockSaved);
  });

  it("recarrega viagens salvas via reload", async () => {
    const first = [{ id: "1", title: "Saved 1", saved: true }];
    const second = [{ id: "2", title: "Saved 2", saved: true }];
    mockListSavedTravels.mockResolvedValueOnce(first).mockResolvedValueOnce(second);

    const { result } = renderHook(() => useSavedTripsViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.savedTrips).toEqual(first);

    await act(async () => {
      await result.current.reload();
    });

    expect(mockListSavedTravels).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.savedTrips).toEqual(second);
  });

  it("finaliza loading e mantém lista vazia quando dá erro", async () => {
    mockListSavedTravels.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSavedTripsViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockListSavedTravels).toHaveBeenCalledTimes(1);
    expect(result.current.savedTrips).toEqual([]);
  });
});
