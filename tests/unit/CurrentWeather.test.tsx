import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CurrentWeather from "../../src/components/CurrentWeather";
import { mockWeatherData } from "../../src/mocks/weatherData";

describe("CurrentWeather", () => {
  it("shows current conditions and metrics in the selected unit", () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current!}
        unit="fahrenheit"
      />,
    );

    expect(screen.getByText("São Paulo, Brasil")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.getByText("13,5 km/h")).toBeInTheDocument();
    expect(screen.getByText("0 mm")).toBeInTheDocument();
    expect(screen.getByText("1.014 hPa")).toBeInTheDocument();
    expect(screen.getByText("72 °F")).toBeInTheDocument();
    expect(screen.getByText("🌤️")).toBeInTheDocument();
    expect(screen.getByText("Predominantemente limpo")).toBeInTheDocument();
  });

  it("marks unavailable metrics and unknown weather codes explicitly", () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={{
          ...mockWeatherData.current!,
          humidityPercent: null,
          windSpeedKmh: null,
          precipitationMm: null,
          pressureHpa: null,
          weatherCode: 999,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getAllByText("—")).toHaveLength(4);
    expect(screen.getByText("Condição indisponível")).toBeInTheDocument();
    expect(screen.getByText("22 °C")).toBeInTheDocument();
    expect(screen.queryByText(/NaN|undefined/)).not.toBeInTheDocument();
  });
});