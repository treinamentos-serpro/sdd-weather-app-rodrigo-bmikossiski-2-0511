import { afterEach, describe, expect, it, vi } from "vitest";
import { mockWeatherData } from "../../src/mocks/weatherData";
import {
  getWeather,
  WeatherServiceError,
} from "../../src/services/weatherService";

afterEach(() => {
  vi.unstubAllGlobals();
});

function createForecastPayload() {
  return {
    timezone: "America/Sao_Paulo",
    current: {
      time: "2026-11-05T12:00",
      temperature_2m: 22,
      weather_code: 1,
      relative_humidity_2m: 72,
      wind_speed_10m: 13.5,
      precipitation: 0,
      surface_pressure: 1014.2,
    },
    daily: {
      time: [
        "2026-11-05",
        "2026-11-06",
        "2026-11-07",
        "2026-11-08",
        "2026-11-09",
      ],
      temperature_2m_min: [18, 19, 20, 19, 18],
      temperature_2m_max: [26, 27, 28, 25, 24],
      weather_code: [1, 2, 3, 61, 80],
      precipitation_probability_max: [10, 20, 30, 65, 45],
    },
  };
}

describe("getWeather", () => {
  it("maps current conditions and five parallel daily entries", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => createForecastPayload(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const weather = await getWeather(mockWeatherData.city);
    const [requestUrl] = fetchMock.mock.calls[0] as [URL];

    expect(requestUrl.searchParams.get("current")).toContain("temperature_2m");
    expect(requestUrl.searchParams.get("daily")).toContain(
      "precipitation_probability_max",
    );
    expect(requestUrl.searchParams.get("timezone")).toBe("auto");
    expect(requestUrl.searchParams.get("forecast_days")).toBe("5");
    expect(weather.city).toEqual(mockWeatherData.city);
    expect(weather.current).toEqual({
      time: "2026-11-05T12:00",
      temperatureC: 22,
      weatherCode: 1,
      humidityPercent: 72,
      windSpeedKmh: 13.5,
      precipitationMm: 0,
      pressureHpa: 1014.2,
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0]).toEqual({
      date: "2026-11-05",
      temperatureMinC: 18,
      temperatureMaxC: 26,
      weatherCode: 1,
      precipitationProbabilityPercent: 10,
    });
    expect(weather.forecast[4]?.date).toBe("2026-11-09");
  });

  it.each(["current", "daily"] as const)(
    "throws WeatherServiceError when %s is missing",
    async (missingSection) => {
      const payload = createForecastPayload();
      delete payload[missingSection];
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => payload,
        }),
      );

      const error = await getWeather(mockWeatherData.city).catch(
        (caught: unknown) => caught,
      );

      expect(error).toBeInstanceOf(WeatherServiceError);
      expect(error).toMatchObject({ kind: "invalid-response" });
    },
  );
});