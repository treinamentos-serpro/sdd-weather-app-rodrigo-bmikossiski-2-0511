import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ForecastList from "../../src/components/ForecastList";
import { mockWeatherData } from "../../src/mocks/weatherData";

describe("ForecastList", () => {
  it("renders five daily cards with localized labels and current unit", () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="fahrenheit" />);

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(5);
    expect(screen.getByRole("heading", { name: "quinta-feira, 5 de novembro" })).toBeInTheDocument();
    const firstCard = screen.getByRole("article", {
      name: "quinta-feira, 5 de novembro",
    });
    expect(within(firstCard).getByText("79 °F")).toBeInTheDocument();
    expect(within(firstCard).getByText("64 °F")).toBeInTheDocument();
    expect(within(firstCard).getByText("10%")).toBeInTheDocument();
    expect(
      within(firstCard).getByText("Predominantemente limpo"),
    ).toBeInTheDocument();
  });

  it("shows unavailable probability without hiding other forecast values", () => {
    const forecast = mockWeatherData.forecast.map((day, index) =>
      index === 0 ? { ...day, precipitationProbabilityPercent: null } : day,
    );

    render(<ForecastList forecast={forecast} unit="celsius" />);

    const firstCard = screen.getByRole("article", {
      name: "quinta-feira, 5 de novembro",
    });
    expect(within(firstCard).getByText("—")).toBeInTheDocument();
    expect(within(firstCard).getByText("26 °C")).toBeInTheDocument();
    expect(within(firstCard).queryByText(/NaN|undefined/)).not.toBeInTheDocument();
  });

  it("renders an empty state when there are no forecast days", () => {
    render(<ForecastList forecast={[]} unit="celsius" />);

    expect(screen.getByRole("status")).toHaveTextContent("Previsão indisponível");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});