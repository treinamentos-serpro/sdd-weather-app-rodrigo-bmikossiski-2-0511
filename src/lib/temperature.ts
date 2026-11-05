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