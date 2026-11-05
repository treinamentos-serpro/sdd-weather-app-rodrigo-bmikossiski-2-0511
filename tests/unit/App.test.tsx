import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { mockWeatherData } from "../../src/mocks/weatherData";
import { getWeather, searchCities } from "../../src/services/weatherService";
import type { City, WeatherData } from "../../src/types/weather";

vi.mock("../../src/services/weatherService", () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const city = mockWeatherData.city;
const anotherCity: City = {
  name: "Recife",
  country: "Brasil",
  countryCode: "BR",
  latitude: -8.05,
  longitude: -34.9,
};

beforeEach(() => {
  vi.resetAllMocks();
});

async function submitCity(name: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole("searchbox", { name: "Cidade" }), name);
  await user.click(screen.getByRole("button", { name: "Buscar" }));
}

describe("App", () => {
  it("renders the idle state initially", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Clima local" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Consulte o clima da sua cidade" }),
    ).toBeInTheDocument();
  });

  it("renders loading while searching and loading the first city's weather", async () => {
    let resolveSearch: (cities: City[]) => void = () => undefined;
    vi.mocked(searchCities).mockReturnValue(
      new Promise<City[]>((resolve) => {
        resolveSearch = resolve;
      }),
    );
    vi.mocked(getWeather).mockReturnValue(new Promise<WeatherData>(() => undefined));
    render(<App />);

    await submitCity("São Paulo");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Consultando o clima de São Paulo...",
    );
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      resolveSearch([city]);
    });

    expect(getWeather).toHaveBeenCalledWith(city);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders empty when the city search returns no results", async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    render(<App />);

    await submitCity("Recife");

    expect(
      await screen.findByRole("heading", { name: "Nenhuma cidade encontrada" }),
    ).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it("renders an error and retries the failed search", async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new Error("Falha de rede."))
      .mockResolvedValueOnce([city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    await submitCity("São Paulo");
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha de rede.");

    await userEvent.setup().click(
      screen.getByRole("button", { name: "Tentar novamente" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Clima atual" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", {
        name: "Dados meteorológicos para São Paulo, Brasil",
      }),
    ).toHaveFocus();
    expect(searchCities).toHaveBeenCalledTimes(2);
  });

  it("renders a forecast API error and retries the lookup", async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error("Falha na consulta de previsão (HTTP 503)."))
      .mockResolvedValueOnce(mockWeatherData);
    render(<App />);

    await submitCity("São Paulo");
    expect(await screen.findByRole("alert")).toHaveTextContent("HTTP 503");

    await userEvent.setup().click(
      screen.getByRole("button", { name: "Tentar novamente" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Clima atual" }),
    ).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it("shows valid forecast when current measurements are missing", async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue({
      ...mockWeatherData,
      current: {
        ...mockWeatherData.current!,
        temperatureC: null,
        weatherCode: null,
      },
    });
    render(<App />);

    await submitCity("São Paulo");

    expect(await screen.findByText("Indisponível")).toBeInTheDocument();
    expect(screen.getByText("26 °C")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Previsão de 5 dias" })).toBeVisible();
  });

  it("applies a unit change made while weather data is loading", async () => {
    let resolveWeather: (weather: WeatherData) => void = () => undefined;
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockReturnValue(
      new Promise<WeatherData>((resolve) => {
        resolveWeather = resolve;
      }),
    );
    render(<App />);

    await submitCity("São Paulo");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Consultando o clima de São Paulo...",
    );
    await userEvent.setup().click(
      screen.getByRole("button", { name: "Fahrenheit" }),
    );

    await act(async () => {
      resolveWeather(mockWeatherData);
    });

    expect(screen.getByText("72 °F")).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it("renders success, allows selecting another result, and derives unit in the UI", async () => {
    vi.mocked(searchCities).mockResolvedValue([city, anotherCity]);
    vi.mocked(getWeather)
      .mockResolvedValueOnce(mockWeatherData)
      .mockResolvedValueOnce({ ...mockWeatherData, city: anotherCity });
    render(<App />);

    await submitCity("São Paulo");
    expect(
      await screen.findByRole("heading", { name: "Clima atual" }),
    ).toBeInTheDocument();

    await userEvent.setup().click(
      screen.getByRole("button", { name: "Recife, Brasil" }),
    );
    const weatherArticle = await screen.findByRole("article", {
      name: "Clima atual",
    });
    expect(within(weatherArticle).getByText("Recife, Brasil")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Recife, Brasil" }),
    ).toHaveAttribute("aria-pressed", "true");

    await userEvent.setup().click(
      screen.getByRole("button", { name: "Fahrenheit" }),
    );
    expect(within(weatherArticle).getByText("72 °F")).toBeInTheDocument();
  });
});