import type { WeatherData } from "../types/weather";

export const mockWeatherData: WeatherData = {
  city: {
    name: "São Paulo",
    administrativeArea: "São Paulo",
    country: "Brasil",
    countryCode: "BR",
    latitude: -23.55,
    longitude: -46.63,
    timezone: "America/Sao_Paulo",
  },
  timezone: "America/Sao_Paulo",
  current: {
    time: "2026-11-05T12:00",
    temperatureC: 22,
    weatherCode: 1,
    humidityPercent: 72,
    windSpeedKmh: 13.5,
    precipitationMm: 0,
    pressureHpa: 1014.2,
  },
  forecast: [
    {
      date: "2026-11-05",
      temperatureMinC: 18,
      temperatureMaxC: 26,
      weatherCode: 1,
      precipitationProbabilityPercent: 10,
    },
    {
      date: "2026-11-06",
      temperatureMinC: 19,
      temperatureMaxC: 27,
      weatherCode: 2,
      precipitationProbabilityPercent: 20,
    },
    {
      date: "2026-11-07",
      temperatureMinC: 20,
      temperatureMaxC: 28,
      weatherCode: 3,
      precipitationProbabilityPercent: 30,
    },
    {
      date: "2026-11-08",
      temperatureMinC: 19,
      temperatureMaxC: 25,
      weatherCode: 61,
      precipitationProbabilityPercent: 65,
    },
    {
      date: "2026-11-09",
      temperatureMinC: 18,
      temperatureMaxC: 24,
      weatherCode: 80,
      precipitationProbabilityPercent: 45,
    },
  ],
};