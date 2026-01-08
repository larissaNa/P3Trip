import React from "react";
const TestRenderer = require("react-test-renderer");
const act = TestRenderer.act as any;

import { useSavedTripsViewModel } from "../../src/viewmodel/useSavedTripsViewModel";

jest.mock("@react-navigation/native", () => {
  const React = require("react");
  return {
    useFocusEffect: (cb: any) => {
      React.useEffect(() => cb(), [cb]);
    },
  };
});

jest.mock("../../src/model/services/TravelService", () => {
  const listSavedTravels = jest.fn();
  return {
    TravelService: jest.fn().mockImplementation(() => ({
      listSavedTravels,
    })),
    __mocks: {
      listSavedTravels,
    },
  };
});

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

function renderHook<TResult>(hook: () => TResult) {
  let latest: TResult | undefined;

  function TestComponent() {
    latest = hook();
    return null;
  }

  let renderer: any;
  act(() => {
    renderer = TestRenderer.create(React.createElement(TestComponent));
  });

  return {
    get result() {
      if (latest === undefined) throw new Error("Hook result not available");
      return latest;
    },
    rerender() {
      act(() => {
        renderer.update(React.createElement(TestComponent));
      });
    },
    unmount() {
      renderer.unmount();
    },
  };
}

describe("useSavedTripsViewModel", () => {
  const travelServiceModule = require("../../src/model/services/TravelService") as any;
  const listSavedTravelsMock = travelServiceModule.__mocks.listSavedTravels as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("carrega viagens salvas no foco com sucesso", async () => {
    const mockSaved = [{ id: "1", title: "Saved", saved: true }];
    listSavedTravelsMock.mockResolvedValueOnce(mockSaved);

    const hook = renderHook(useSavedTripsViewModel);

    expect(hook.result.loading).toBe(true);
    expect(hook.result.savedTrips).toEqual([]);

    await act(async () => {
      await flushPromises();
    });

    expect(listSavedTravelsMock).toHaveBeenCalledTimes(1);
    expect(hook.result.loading).toBe(false);
    expect(hook.result.savedTrips).toEqual(mockSaved);
  });

  it("recarrega viagens salvas via reload", async () => {
    const first = [{ id: "1", title: "Saved 1", saved: true }];
    const second = [{ id: "2", title: "Saved 2", saved: true }];
    listSavedTravelsMock.mockResolvedValueOnce(first).mockResolvedValueOnce(second);

    const hook = renderHook(useSavedTripsViewModel);

    await act(async () => {
      await flushPromises();
    });

    expect(hook.result.savedTrips).toEqual(first);

    await act(async () => {
      await hook.result.reload();
      await flushPromises();
    });

    expect(listSavedTravelsMock).toHaveBeenCalledTimes(2);
    expect(hook.result.loading).toBe(false);
    expect(hook.result.savedTrips).toEqual(second);
  });

  it("finaliza loading e mantém lista vazia quando dá erro", async () => {
    listSavedTravelsMock.mockRejectedValueOnce(new Error("Network error"));

    const hook = renderHook(useSavedTripsViewModel);

    await act(async () => {
      await flushPromises();
    });

    expect(listSavedTravelsMock).toHaveBeenCalledTimes(1);
    expect(hook.result.loading).toBe(false);
    expect(hook.result.savedTrips).toEqual([]);
  });
});
