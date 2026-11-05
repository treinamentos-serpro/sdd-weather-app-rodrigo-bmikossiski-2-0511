import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchWithTimeout,
  searchCities,
  WeatherServiceError,
} from "../../src/services/weatherService";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("fetchWithTimeout", () => {
  it("converts an abort after 10 seconds and clears the timer", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const request = fetchWithTimeout("https://example.test/data");
    const result = request.catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(10_000);
    const error = await result;

    expect(error).toBeInstanceOf(WeatherServiceError);
    expect(error).toMatchObject({
      name: "WeatherServiceError",
      message: "A requisição demorou demais.",
      kind: "timeout",
    });

    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });

  it("converts network failures and clears the timer", async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    await expect(fetchWithTimeout("https://example.test/data")).rejects.toMatchObject({
      name: "WeatherServiceError",
      message: "Falha de rede.",
      kind: "network",
    });

    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });

  it("clears the timer when the request succeeds", async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const response = { ok: true, status: 200 } as Response;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    await expect(fetchWithTimeout("https://example.test/data")).resolves.toBe(
      response,
    );

    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });
});

describe("searchCities", () => {
  it("returns an empty list for blank input without calling the network", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("   ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("encodes the trimmed name and maps results to City", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            id: 3448439,
            name: "São Paulo",
            latitude: -23.55,
            longitude: -46.63,
            admin1: "São Paulo",
            country: "Brasil",
            country_code: "BR",
            timezone: "America/Sao_Paulo",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const cities = await searchCities("  São Paulo  ");
    const [url] = fetchMock.mock.calls[0] as [string];

    expect(url).toContain(`name=${encodeURIComponent("São Paulo")}`);
    expect(url).toContain("count=5");
    expect(url).toContain("language=pt");
    expect(cities).toEqual([
      {
        id: 3448439,
        name: "São Paulo",
        administrativeArea: "São Paulo",
        country: "Brasil",
        countryCode: "BR",
        latitude: -23.55,
        longitude: -46.63,
        timezone: "America/Sao_Paulo",
      },
    ]);
  });

  it("throws WeatherServiceError for a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    const error = await searchCities("Lisboa").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(WeatherServiceError);
    expect(error).toMatchObject({
      name: "WeatherServiceError",
      kind: "http",
      statusCode: 503,
    });
  });
});