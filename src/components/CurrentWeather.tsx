import type { City, CurrentWeather as CurrentWeatherData, Unit } from "../types/weather";
import { convertTemperature } from "../lib/temperature";
import { getWeatherPresentation } from "../lib/weatherCodes";

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | null, maximumFractionDigits = 0): string {
  if (value === null || !Number.isFinite(value)) return "Indisponível";

  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits }).format(value);
}

export default function CurrentWeather({
  city,
  current,
  unit,
}: CurrentWeatherProps) {
  const temperature = convertTemperature(current.temperatureC, unit);
  const unitSymbol = unit === "celsius" ? "°C" : "°F";
  const weather = getWeatherPresentation(current.weatherCode);
  const location = [city.name, city.administrativeArea, city.country]
    .filter(Boolean)
    .filter((name, index, names) => names.indexOf(name) === index)
    .join(", ");

  return (
    <article
      aria-labelledby="current-weather-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-7"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            className="text-sm font-medium uppercase text-white/75"
            id="current-weather-title"
          >
            Clima atual
          </h2>
          <p className="mt-1 text-lg font-semibold text-white">{location}</p>
        </div>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-4xl" role="img">
            {weather.icon}
          </span>
          <span className="max-w-40 text-right text-sm text-white/80">
            {weather.description}
          </span>
        </div>
      </header>

      <p className="mt-5 text-6xl font-semibold leading-none text-white sm:text-7xl">
        {temperature === null
          ? "Indisponível"
          : `${temperature} ${unitSymbol}`}
      </p>

      <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-night-800/60 p-3">
          <dt className="text-xs text-white/75">Umidade</dt>
          <dd className="mt-1 text-base font-medium text-white">
            {current.humidityPercent === null
              ? "Indisponível"
              : `${formatMetric(current.humidityPercent)}%`}
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-800/60 p-3">
          <dt className="text-xs text-white/75">Vento</dt>
          <dd className="mt-1 text-base font-medium text-white">
            {current.windSpeedKmh === null
              ? "Indisponível"
              : `${formatMetric(current.windSpeedKmh, 1)} km/h`}
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-800/60 p-3">
          <dt className="text-xs text-white/75">Precipitação</dt>
          <dd className="mt-1 text-base font-medium text-white">
            {current.precipitationMm === null
              ? "Indisponível"
              : `${formatMetric(current.precipitationMm, 1)} mm`}
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-800/60 p-3">
          <dt className="text-xs text-white/75">Pressão</dt>
          <dd className="mt-1 text-base font-medium text-white">
            {current.pressureHpa === null
              ? "Indisponível"
              : `${formatMetric(current.pressureHpa)} hPa`}
          </dd>
        </div>
      </dl>
    </article>
  );
}