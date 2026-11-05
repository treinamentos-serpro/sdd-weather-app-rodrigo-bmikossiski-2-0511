import type { ForecastDay, Unit } from "../types/weather";
import ForecastCard from "./ForecastCard";

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="w-full">
      <h2
        className="mb-3 text-lg font-semibold text-white"
        id="forecast-heading"
      >
        Previsão de 5 dias
      </h2>

      {forecast.length === 0 ? (
        <p className="text-sm text-white/70" role="status">
          Previsão indisponível
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.map((day) => (
            <li className="min-w-0" key={day.date}>
              <ForecastCard day={day} unit={unit} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}