import type { ForecastDay, Unit } from "../types/weather";
import { formatDayLabel } from "../lib/format";
import { convertTemperature } from "../lib/temperature";
import { getWeatherPresentation } from "../lib/weatherCodes";

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

function formatMetric(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Indisponível";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const maximum = convertTemperature(day.temperatureMaxC, unit);
  const minimum = convertTemperature(day.temperatureMinC, unit);
  const unitSymbol = unit === "celsius" ? "°C" : "°F";
  const weather = getWeatherPresentation(day.weatherCode);

  return (
    <article
      aria-labelledby={`forecast-day-${day.date}`}
      className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3 shadow-glass backdrop-blur-md sm:p-4"
    >
      <header className="flex min-h-14 items-start justify-between gap-2">
        <h3
          className="break-words text-sm font-semibold capitalize leading-tight text-white"
          id={`forecast-day-${day.date}`}
        >
          {formatDayLabel(day.date)}
        </h3>
        <span
          aria-label={weather.description}
          className="shrink-0 text-2xl"
          role="img"
        >
          {weather.icon}
        </span>
      </header>

      <p className="mt-3 text-xl font-semibold text-white">
        {maximum === null ? "—" : `${maximum} ${unitSymbol}`}
        <span className="ml-2 text-sm font-normal text-white/75">
          {minimum === null ? "—" : `${minimum} ${unitSymbol}`}
        </span>
      </p>
      <p className="mt-1 min-h-10 text-sm text-white/75">{weather.description}</p>

      <dl className="mt-3 border-t border-white/10 pt-3">
        <dt className="text-xs text-white/75">Prob. de chuva</dt>
        <dd className="mt-1 text-sm font-medium text-white">
          {day.precipitationProbabilityPercent === null
            ? "Indisponível"
            : `${formatMetric(day.precipitationProbabilityPercent)}%`}
        </dd>
      </dl>
    </article>
  );
}