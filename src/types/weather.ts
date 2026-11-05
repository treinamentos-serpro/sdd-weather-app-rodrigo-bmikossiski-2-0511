export type Unit = "celsius" | "fahrenheit";

export interface City {
  id?: number; // Identificador GeoNames, quando disponível.
  name: string; // Nome da cidade retornado na busca.
  administrativeArea?: string; // Região administrativa (Open-Meteo: admin1).
  country?: string; // Nome do país.
  countryCode?: string; // Código do país (Open-Meteo: country_code).
  latitude: number; // Latitude usada na consulta meteorológica.
  longitude: number; // Longitude usada na consulta meteorológica.
  timezone?: string; // Fuso IANA, quando retornado pela geocodificação.
}

export interface CurrentWeather {
  time: string; // Horário local retornado em current.time.
  temperatureC: number | null; // Temperatura de current.temperature_2m, em Celsius.
  weatherCode: number | null; // Código WMO de current.weather_code.
  humidityPercent: number | null; // Umidade relativa em current.relative_humidity_2m.
  windSpeedKmh: number | null; // Velocidade do vento em current.wind_speed_10m, km/h.
  precipitationMm: number | null; // Precipitação em current.precipitation, mm.
  pressureHpa: number | null; // Pressão ao nível da superfície em current.surface_pressure, hPa.
}

export interface ForecastDay {
  date: string; // Data local no formato YYYY-MM-DD.
  temperatureMinC: number | null; // daily.temperature_2m_min, em Celsius.
  temperatureMaxC: number | null; // daily.temperature_2m_max, em Celsius.
  weatherCode: number | null; // Código WMO diário de daily.weather_code.
  precipitationProbabilityPercent: number | null; // daily.precipitation_probability_max, em porcentagem.
}

export interface WeatherData {
  city: City; // Local selecionado pelo usuário.
  timezone: string; // Fuso retornado pelo endpoint de forecast.
  current: CurrentWeather | null; // Condições atuais, se disponíveis.
  forecast: ForecastDay[]; // Previsões diárias retornadas pela API.
}

export type WeatherErrorKind =
  | "network"
  | "timeout"
  | "http"
  | "invalid-response";

export interface WeatherError {
  kind: WeatherErrorKind; // Categoria da falha.
  retryable: boolean; // Indica se a consulta pode ser repetida.
  statusCode?: number; // Código HTTP, quando a falha veio da API.
}