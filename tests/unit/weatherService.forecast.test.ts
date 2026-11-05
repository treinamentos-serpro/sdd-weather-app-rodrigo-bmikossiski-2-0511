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

  it.each([429, 503])(
    "throws WeatherServiceError for forecast HTTP %i",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status }),
      );

      const error = await getWeather(mockWeatherData.city).catch(
        (caught: unknown) => caught,
      );

      expect(error).toBeInstanceOf(WeatherServiceError);
      expect(error).toMatchObject({ kind: "http", statusCode: status });
    },
  );

  it("throws WeatherServiceError for malformed forecast JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("invalid JSON");
        },
      }),
    );

    const error = await getWeather(mockWeatherData.city).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(WeatherServiceError);
    expect(error).toMatchObject({ kind: "invalid-response" });
  });

  it("rejects forecasts with fewer than five dates", async () => {
    const payload = createForecastPayload();
    payload.daily.time.pop();
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
  });

  it("keeps missing and null measurements unavailable in a partial response", async () => {
    const payload = createForecastPayload();
    const currentPayload = payload.current as unknown as Record<string, unknown>;
    const dailyPayload = payload.daily as unknown as Record<string, unknown>;
    delete currentPayload.temperature_2m;
    delete currentPayload.relative_humidity_2m;

    const minimums = dailyPayload.temperature_2m_min as number[];
    delete minimums[0];
    const maximums = dailyPayload.temperature_2m_max as number[];
    maximums.length = 4;
    const precipitationProbabilities =
      dailyPayload.precipitation_probability_max as (number | null)[];
    precipitationProbabilities[0] = null;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    );

    const weather = await getWeather(mockWeatherData.city);

    expect(weather.current?.temperatureC).toBeNull();
    expect(weather.current?.humidityPercent).toBeNull();
    expect(weather.current?.windSpeedKmh).toBe(13.5);
    expect(weather.forecast[0]?.temperatureMinC).toBeNull();
    expect(weather.forecast[0]?.temperatureMaxC).toBe(26);
    expect(weather.forecast[0]?.precipitationProbabilityPercent).toBeNull();
    expect(weather.forecast[4]?.temperatureMaxC).toBeNull();
    expect(weather.forecast[4]?.weatherCode).toBe(80);
  });

  it("maps absent and non-finite measurements to null", async () => {
    const payload = createForecastPayload();
    const currentPayload = payload.current as unknown as Record<string, unknown>;
    const dailyPayload = payload.daily as unknown as Record<string, unknown>;
    delete currentPayload.temperature_2m;
    delete currentPayload.weather_code;
    delete currentPayload.relative_humidity_2m;
    delete currentPayload.wind_speed_10m;
    currentPayload.precipitation = Number.NaN;
    currentPayload.surface_pressure = Number.POSITIVE_INFINITY;
    delete dailyPayload.temperature_2m_min;
    delete dailyPayload.temperature_2m_max;
    delete dailyPayload.weather_code;
    delete dailyPayload.precipitation_probability_max;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    );

    const weather = await getWeather(mockWeatherData.city);

    expect(weather.current).toMatchObject({
      temperatureC: null,
      weatherCode: null,
      humidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      pressureHpa: null,
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0]).toMatchObject({
      temperatureMinC: null,
      temperatureMaxC: null,
      weatherCode: null,
      precipitationProbabilityPercent: null,
    });
  });
});