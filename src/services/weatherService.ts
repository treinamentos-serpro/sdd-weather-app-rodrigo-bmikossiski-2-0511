import type {
  City,
  CurrentWeather,
  ForecastDay,
  WeatherData,
  WeatherErrorKind,
} from "../types/weather";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const MAX_CITY_RESULTS = 5;
const FORECAST_DAYS = 5;
const REQUEST_TIMEOUT_MS = 8_000;

interface OpenMeteoGeocodingResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  country_code?: string;
  timezone?: string;
}

export class WeatherServiceError extends Error {
  readonly kind: WeatherErrorKind;
  readonly statusCode: number | undefined;

  constructor(
    message: string,
    kind: WeatherErrorKind,
    statusCode?: number,
  ) {
    super(message);
    this.name = "WeatherServiceError";
    this.kind = kind;
    this.statusCode = statusCode;
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      throw new WeatherServiceError(
        "A requisição demorou demais.",
        "timeout",
      );
    }

    throw new WeatherServiceError("Falha de rede.", "network");
  } finally {
    clearTimeout(timeoutId);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function requiredArray(record: Record<string, unknown>, key: string): unknown[] {
  const value = record[key];
  if (!Array.isArray(value)) {
    throw new WeatherServiceError(
      `Resposta de forecast sem o array ${key}.`,
      "invalid-response",
    );
  }
  return value;
}

function mapGeocodingResult(value: unknown): City {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    typeof value.latitude !== "number" ||
    !Number.isFinite(value.latitude) ||
    typeof value.longitude !== "number" ||
    !Number.isFinite(value.longitude)
  ) {
    throw new WeatherServiceError(
      "Resposta de geocodificação inválida.",
      "invalid-response",
    );
  }

  const result = value as unknown as OpenMeteoGeocodingResult;

  return {
    ...(typeof result.id === "number" ? { id: result.id } : {}),
    name: result.name,
    ...(typeof result.admin1 === "string"
      ? { administrativeArea: result.admin1 }
      : {}),
    ...(typeof result.country === "string" ? { country: result.country } : {}),
    ...(typeof result.country_code === "string"
      ? { countryCode: result.country_code }
      : {}),
    latitude: result.latitude,
    longitude: result.longitude,
    ...(typeof result.timezone === "string"
      ? { timezone: result.timezone }
      : {}),
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const normalizedName = name.trim();
  if (normalizedName.length === 0) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(normalizedName)}&count=${MAX_CITY_RESULTS}&language=pt&format=json`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Falha na busca de cidades (HTTP ${response.status}).`,
      "http",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError(
      "O serviço de busca retornou uma resposta inválida.",
      "invalid-response",
    );
  }

  if (!isRecord(payload)) {
    throw new WeatherServiceError(
      "O serviço de busca retornou uma resposta inválida.",
      "invalid-response",
    );
  }

  if (payload.results === undefined) return [];
  if (!Array.isArray(payload.results)) {
    throw new WeatherServiceError(
      "O serviço de busca retornou uma lista de cidades inválida.",
      "invalid-response",
    );
  }

  return payload.results
    .slice(0, MAX_CITY_RESULTS)
    .map(mapGeocodingResult);
}

export async function getWeather(city: City): Promise<WeatherData> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure",
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max",
  );
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", String(FORECAST_DAYS));

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Falha na consulta de previsão (HTTP ${response.status}).`,
      "http",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError(
      "O serviço de previsão retornou uma resposta inválida.",
      "invalid-response",
    );
  }

  if (!isRecord(payload) || typeof payload.timezone !== "string") {
    throw new WeatherServiceError(
      "A resposta de forecast não contém um timezone válido.",
      "invalid-response",
    );
  }

  const currentPayload = payload.current;
  const dailyPayload = payload.daily;
  if (!isRecord(currentPayload) || !isRecord(dailyPayload)) {
    throw new WeatherServiceError(
      "A resposta de forecast precisa conter current e daily.",
      "invalid-response",
    );
  }

  if (typeof currentPayload.time !== "string") {
    throw new WeatherServiceError(
      "A resposta de forecast não contém o horário atual.",
      "invalid-response",
    );
  }

  const dates = requiredArray(dailyPayload, "time");
  if (
    dates.length < FORECAST_DAYS ||
    dates.slice(0, FORECAST_DAYS).some((date) => typeof date !== "string")
  ) {
    throw new WeatherServiceError(
      `A resposta de forecast precisa conter ${FORECAST_DAYS} datas válidas.`,
      "invalid-response",
    );
  }

  const minimums = dailyPayload.temperature_2m_min;
  const maximums = dailyPayload.temperature_2m_max;
  const weatherCodes = dailyPayload.weather_code;
  const precipitationProbabilities = dailyPayload.precipitation_probability_max;

  const current: CurrentWeather = {
    time: currentPayload.time,
    temperatureC: nullableNumber(currentPayload.temperature_2m),
    weatherCode: nullableNumber(currentPayload.weather_code),
    humidityPercent: nullableNumber(currentPayload.relative_humidity_2m),
    windSpeedKmh: nullableNumber(currentPayload.wind_speed_10m),
    precipitationMm: nullableNumber(currentPayload.precipitation),
    pressureHpa: nullableNumber(currentPayload.surface_pressure),
  };

  const forecast: ForecastDay[] = dates
    .slice(0, FORECAST_DAYS)
    .map((date, index) => ({
      date: date as string,
      temperatureMinC: nullableNumber(
        Array.isArray(minimums) ? minimums[index] : undefined,
      ),
      temperatureMaxC: nullableNumber(
        Array.isArray(maximums) ? maximums[index] : undefined,
      ),
      weatherCode: nullableNumber(
        Array.isArray(weatherCodes) ? weatherCodes[index] : undefined,
      ),
      precipitationProbabilityPercent: nullableNumber(
        Array.isArray(precipitationProbabilities)
          ? precipitationProbabilities[index]
          : undefined,
      ),
    }));

  return {
    city,
    timezone: payload.timezone,
    current,
    forecast,
  };
}