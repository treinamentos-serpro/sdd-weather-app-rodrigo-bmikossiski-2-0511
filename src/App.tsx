import { useEffect, useRef, useState } from "react";
import CurrentWeather from "./components/CurrentWeather";
import EmptyState from "./components/states/EmptyState";
import ErrorState from "./components/states/ErrorState";
import ForecastList from "./components/ForecastList";
import LoadingState from "./components/states/LoadingState";
import SearchBar from "./components/SearchBar";
import UnitToggle from "./components/UnitToggle";
import { useWeather } from "./hooks/useWeather";
import type { City, Unit } from "./types/weather";

function getCityLabel(city: City): string {
  return [city.name, city.administrativeArea, city.country]
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(", ");
}

export default function App() {
  const [unit, setUnit] = useState<Unit>("celsius");
  const { status, data, cities, error, query, search, selectCity, retry } =
    useWeather();
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === "success") resultsRef.current?.focus();
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-night-900 to-night-800 text-white">
      <header className="border-b border-white/10 bg-night-900/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-x-4 lg:px-8">
          <h1 className="text-base font-semibold text-white">
            <a className="flex items-center gap-2" href="#inicio">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-xl"
              >
                ☀️
              </span>
              <span>Clima local</span>
            </a>
          </h1>

          <div className="min-w-0 md:col-start-2 md:row-start-1">
            <SearchBar
              disabled={status === "loading"}
              onSearch={search}
            />
          </div>

          <div className="self-end md:col-start-3 md:row-start-1 md:justify-self-end">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        aria-busy={status === "loading"}
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        id="inicio"
      >
        {status === "idle" && (
          <section
            aria-labelledby="welcome-title"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-glass backdrop-blur-md sm:p-10"
          >
            <h2
              className="text-2xl font-semibold text-white sm:text-3xl"
              id="welcome-title"
            >
              Consulte o clima da sua cidade
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Para esta prévia, busque São Paulo para ver os dados de exemplo.
            </p>
          </section>
        )}

        {status === "loading" && (
          <LoadingState
            message={
              query.length > 0
                ? `Consultando o clima de ${query}...`
                : "Consultando o clima..."
            }
          />
        )}

        {status === "empty" && (
          <EmptyState
            hint="Confira a grafia ou tente São Paulo, a cidade disponível nesta prévia."
            title="Nenhuma cidade encontrada"
          />
        )}

        {status === "error" && (
          <ErrorState
            message={error?.message ?? "Não foi possível carregar os dados do clima."}
            onRetry={() => void retry()}
          />
        )}

        {cities.length > 1 && (
          <section aria-labelledby="city-results-heading">
            <h2
              className="mb-3 text-lg font-semibold text-white"
              id="city-results-heading"
            >
              Cidades encontradas
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((city) => {
                const isSelected =
                  data?.city.latitude === city.latitude &&
                  data.city.longitude === city.longitude;

                return (
                  <li key={`${city.latitude},${city.longitude}`}>
                    <button
                      aria-pressed={isSelected}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white shadow-glass backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 aria-pressed:border-accent-400 aria-pressed:bg-white/10"
                      onClick={() => void selectCity(city)}
                      type="button"
                    >
                      {getCityLabel(city)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {status === "success" && data && (
          <section
            aria-label={`Dados meteorológicos para ${getCityLabel(data.city)}`}
            className="flex flex-col gap-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-4 focus-visible:ring-offset-night-900"
            ref={resultsRef}
            tabIndex={-1}
          >
            {data.current ? (
              <CurrentWeather
                city={data.city}
                current={data.current}
                unit={unit}
              />
            ) : (
              <EmptyState
                hint="Os dados atuais não estão disponíveis; a previsão pode continuar disponível."
                title="Clima atual indisponível"
              />
            )}
            <ForecastList forecast={data.forecast} unit={unit} />
          </section>
        )}
      </main>
    </div>
  );
}