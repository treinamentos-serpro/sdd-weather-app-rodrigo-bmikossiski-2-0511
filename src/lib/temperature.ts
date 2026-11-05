import type { Unit } from "../types/weather";

export function convertTemperature(
  temperatureC: number | null,
  unit: Unit,
): number | null {
  if (temperatureC === null || !Number.isFinite(temperatureC)) return null;

  const temperature =
    unit === "fahrenheit" ? (temperatureC * 9) / 5 + 32 : temperatureC;

  return Math.round(temperature);
}

export function formatTemperature(
  temperatureC: number | null,
  unit: Unit,
): string {
  const temperature = convertTemperature(temperatureC, unit);
  if (temperature === null) return "Indisponível";

  const symbol = unit === "celsius" ? "°C" : "°F";
  return `${temperature} ${symbol}`;
}

export function unitLabel(unit: Unit): string {
  return unit === "celsius" ? "Celsius" : "Fahrenheit";
}