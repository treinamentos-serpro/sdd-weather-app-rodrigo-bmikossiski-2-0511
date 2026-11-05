import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockWeatherData } from "../../src/mocks/weatherData";
import { getWeather, searchCities } from "../../src/services/weatherService";
import { useWeather } from "../../src/hooks/useWeather";

vi.mock("../../src/services/weatherService", () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const city = mockWeatherData.city;

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useWeather", () => {
  it("starts idle and returns empty without calling services for blank input", async () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe("idle");

    await act(async () => {
      await result.current.search("   ");
    });

    expect(result.current.status).toBe("empty");
    expect(result.current.query).toBe("");
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it("loads weather for the first city returned by search", async () => {
    vi.mocked(searchCities).mockResolvedValue([city, { ...city, name: "Recife" }]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("  São Paulo  ");
    });

    expect(searchCities).toHaveBeenCalledWith("São Paulo");
    expect(getWeather).toHaveBeenCalledWith(city);
    expect(result.current.status).toBe("success");
    expect(result.current.cities).toHaveLength(2);
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();
  });

  it("sets empty when search has no results", async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("Recife");
    });

    expect(result.current.status).toBe("empty");
    expect(result.current.cities).toEqual([]);
    expect(getWeather).not.toHaveBeenCalled();
  });

  it("sets error and retry repeats the failed search", async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new Error("Falha de rede."))
      .mockResolvedValueOnce([city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("São Paulo");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Falha de rede.");

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual(mockWeatherData);
  });

  it("retries a selected city's weather request", async () => {
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error("A requisição demorou demais."))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(city);
    });
    expect(result.current.status).toBe("error");

    await act(async () => {
      await result.current.retry();
    });

    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenNthCalledWith(1, city);
    expect(getWeather).toHaveBeenNthCalledWith(2, city);
    expect(result.current.status).toBe("success");
  });
});