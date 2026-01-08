import React from "react";
const TestRenderer = require("react-test-renderer");
const act = TestRenderer.act as any;
import { Linking } from "react-native";

import { useTravelDetailsViewModel } from "../../src/viewmodel/useTravelDetailsViewModel";

jest.mock("../../src/model/services/TravelService", () => {
  const updateSavedStatus = jest.fn();
  return {
    TravelService: jest.fn().mockImplementation(() => ({
      updateSavedStatus,
    })),
    __mocks: {
      updateSavedStatus,
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

describe("useTravelDetailsViewModel", () => {
  const travelServiceModule = require("../../src/model/services/TravelService") as any;
  const updateSavedStatusMock = travelServiceModule.__mocks.updateSavedStatus as jest.Mock;
  const openURLMock = jest.spyOn(Linking, "openURL");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inicializa isSaved a partir do travel", () => {
    const hook = renderHook(() =>
      useTravelDetailsViewModel({ id: "1", title: "Trip", saved: true })
    );

    expect(hook.result.isSaved).toBe(true);
  });

  it("toggleSave alterna o estado e chama o service (sucesso)", async () => {
    updateSavedStatusMock.mockResolvedValueOnce(true);
    const travel = { id: "1", title: "Trip", saved: false };

    const hook = renderHook(() => useTravelDetailsViewModel(travel));

    await act(async () => {
      await hook.result.toggleSave();
      await flushPromises();
    });

    expect(updateSavedStatusMock).toHaveBeenCalledWith("1", true);
    expect(hook.result.isSaved).toBe(true);
  });

  it("toggleSave reverte o estado quando service retorna false", async () => {
    updateSavedStatusMock.mockResolvedValueOnce(false);
    const travel = { id: "1", title: "Trip", saved: false };

    const hook = renderHook(() => useTravelDetailsViewModel(travel));

    await act(async () => {
      await hook.result.toggleSave();
      await flushPromises();
    });

    expect(updateSavedStatusMock).toHaveBeenCalledWith("1", true);
    expect(hook.result.isSaved).toBe(false);
  });

  it("toggleSave reverte o estado quando service lança erro", async () => {
    updateSavedStatusMock.mockRejectedValueOnce(new Error("Network error"));
    const travel = { id: "1", title: "Trip", saved: false };

    const hook = renderHook(() => useTravelDetailsViewModel(travel));

    await act(async () => {
      await hook.result.toggleSave();
      await flushPromises();
    });

    expect(updateSavedStatusMock).toHaveBeenCalledWith("1", true);
    expect(hook.result.isSaved).toBe(false);
  });

  it("openWhatsApp chama Linking.openURL com URL codificada", () => {
    openURLMock.mockResolvedValueOnce(undefined);
    const travel = { id: "1", title: "Pacote Especial", saved: false };

    const hook = renderHook(() => useTravelDetailsViewModel(travel));

    hook.result.openWhatsApp();

    const expectedUrl = `https://wa.me/5586998527609?text=${encodeURIComponent(
      "Olá! Quero reservar o pacote: Pacote Especial"
    )}`;
    expect(openURLMock).toHaveBeenCalledWith(expectedUrl);
  });

  it("openWhatsApp não lança quando Linking.openURL falha", () => {
    openURLMock.mockRejectedValueOnce(new Error("Cannot open URL"));
    const travel = { id: "1", title: "Trip", saved: false };

    const hook = renderHook(() => useTravelDetailsViewModel(travel));

    expect(() => hook.result.openWhatsApp()).not.toThrow();
  });
});
