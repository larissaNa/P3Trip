import React from "react";
const TestRenderer = require("react-test-renderer");
const act = TestRenderer.act as any;

import { HomeViewModel } from "../../src/viewmodel/useHomeViewModel";

jest.mock("../../src/model/services/TravelService", () => {
  const listAllTravels = jest.fn();
  return {
    TravelService: jest.fn().mockImplementation(() => ({
      listAllTravels,
    })),
    __mocks: {
      listAllTravels,
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

describe("HomeViewModel", () => {
  const travelServiceModule = require("../../src/model/services/TravelService") as any;
  const listAllTravelsMock = travelServiceModule.__mocks.listAllTravels as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("carrega viagens com sucesso no mount", async () => {
    const mockTrips = [{ id: "1", title: "Trip" }];
    listAllTravelsMock.mockResolvedValueOnce(mockTrips);

    const hook = renderHook(HomeViewModel);

    expect(hook.result.loading).toBe(true);
    expect(hook.result.travelData).toEqual([]);

    await act(async () => {
      await flushPromises();
    });

    expect(listAllTravelsMock).toHaveBeenCalledTimes(1);
    expect(hook.result.loading).toBe(false);
    expect(hook.result.travelData).toEqual(mockTrips);
  });

  it("recarrega viagens via reload", async () => {
    const first = [{ id: "1", title: "First" }];
    const second = [{ id: "2", title: "Second" }];
    listAllTravelsMock.mockResolvedValueOnce(first).mockResolvedValueOnce(second);

    const hook = renderHook(HomeViewModel);

    await act(async () => {
      await flushPromises();
    });

    expect(hook.result.travelData).toEqual(first);

    await act(async () => {
      await hook.result.reload();
      await flushPromises();
    });

    expect(listAllTravelsMock).toHaveBeenCalledTimes(2);
    expect(hook.result.loading).toBe(false);
    expect(hook.result.travelData).toEqual(second);
  });

  it("finaliza loading e mantém lista vazia quando dá erro", async () => {
    listAllTravelsMock.mockRejectedValueOnce(new Error("Network error"));

    const hook = renderHook(HomeViewModel);

    await act(async () => {
      await flushPromises();
    });

    expect(listAllTravelsMock).toHaveBeenCalledTimes(1);
    expect(hook.result.loading).toBe(false);
    expect(hook.result.travelData).toEqual([]);
  });
});
