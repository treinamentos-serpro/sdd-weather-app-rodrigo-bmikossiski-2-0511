import type { ForecastDay, Unit } from "../types/weather";
import { formatDayLabel } from "../lib/format";
import { convertTemperature } from "../lib/temperature";
import { getWeatherPresentation } from "../lib/weatherCodes";

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

function formatMetric(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const maximum = convertTemperature(day.temperatureMaxC, unit);
  const minimum = convertTemperature(day.temperatureMinC, unit);
  const unitSymbol = unit === "celsius" ? "°C" : "°F";
  const weather = getWeatherPresentation(day.weatherCode);
  const precipitationProbability = formatMetric(
    day.precipitationProbabilityPercent,
  );

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
          aria-hidden="true"
          className="shrink-0 text-2xl"
        >
          {weather.icon}
        </span>
      </header>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <dt className="text-xs text-white/75">Máx.</dt>
          <dd className="text-lg font-semibold text-white">
            {maximum === null ? "—" : `${maximum} ${unitSymbol}`}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-white/75">Mín.</dt>
          <dd className="text-lg font-semibold text-white">
            {minimum === null ? "—" : `${minimum} ${unitSymbol}`}
          </dd>
        </div>
      </dl>
      <p className="mt-1 min-h-10 text-sm text-white/75">{weather.description}</p>

      <dl className="mt-3 border-t border-white/10 pt-3">
        <dt className="text-xs text-white/75">Prob. de chuva</dt>
        <dd className="mt-1 text-sm font-medium text-white">
          {precipitationProbability === null
            ? "—"
            : `${precipitationProbability}%`}
        </dd>
      </dl>
    </article>
  );
}