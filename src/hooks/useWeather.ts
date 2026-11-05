import { useRef, useState } from "react";
import { getWeather, searchCities } from "../services/weatherService";
import type { City, WeatherData } from "../types/weather";

export type WeatherStatus = "idle" | "loading" | "success" | "error" | "empty";

type LastOperation =
  | { kind: "search"; name: string }
  | { kind: "select-city"; city: City };

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: Error | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function toError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error("Falha inesperada ao consultar o clima.");
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState("");
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  async function search(name: string): Promise<void> {
    const normalizedName = name.trim();
    const currentRequestId = ++requestId.current;
    lastOperation.current = { kind: "search", name: normalizedName };
    setQuery(normalizedName);
    setData(null);
    setCities([]);
    setError(null);

    if (normalizedName.length === 0) {
      setStatus("empty");
      return;
    }

    setStatus("loading");

    try {
      const results = await searchCities(normalizedName);
      if (currentRequestId !== requestId.current) return;

      setCities(results);
      const firstCity = results[0];
      if (!firstCity) {
        setStatus("empty");
        return;
      }

      const weather = await getWeather(firstCity);
      if (currentRequestId !== requestId.current) return;

      setData(weather);
      setStatus("success");
    } catch (caughtError) {
      if (currentRequestId !== requestId.current) return;

      setError(toError(caughtError));
      setStatus("error");
    }
  }

  async function selectCity(city: City): Promise<void> {
    const currentRequestId = ++requestId.current;
    lastOperation.current = { kind: "select-city", city };
    setQuery(city.name);
    setData(null);
    setError(null);
    setStatus("loading");

    try {
      const weather = await getWeather(city);
      if (currentRequestId !== requestId.current) return;

      setData(weather);
      setStatus("success");
    } catch (caughtError) {
      if (currentRequestId !== requestId.current) return;

      setError(toError(caughtError));
      setStatus("error");
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) return;

    if (operation.kind === "search") {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  return {
    status,
    data,
    cities,
    error,
    query,
    search,
    selectCity,
    retry,
  };
}