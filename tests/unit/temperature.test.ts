import { describe, expect, it } from "vitest";
import {
  convertTemperature,
  formatTemperature,
  unitLabel,
} from "../../src/lib/temperature";

describe("temperature helpers", () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])("converts %i °C to %i °F", (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, "fahrenheit")).toBe(fahrenheit);
  });

  it("converts to the requested unit", () => {
    expect(convertTemperature(21.6, "celsius")).toBe(22);
    expect(convertTemperature(21.6, "fahrenheit")).toBe(71);
  });

  it("formats rounded values with the selected unit symbol", () => {
    expect(formatTemperature(20.4, "celsius")).toBe("20 °C");
    expect(formatTemperature(20.4, "fahrenheit")).toBe("69 °F");
  });

  it("formats unavailable temperatures without inventing a value", () => {
    expect(formatTemperature(null, "celsius")).toBe("Indisponível");
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "treats non-finite value %s as unavailable",
    (temperature) => {
      expect(convertTemperature(temperature, "fahrenheit")).toBeNull();
      expect(formatTemperature(temperature, "fahrenheit")).toBe("Indisponível");
    },
  );

  it.each([
    ["celsius", "Celsius"],
    ["fahrenheit", "Fahrenheit"],
  ] as const)("labels the %s unit", (unit, label) => {
    expect(unitLabel(unit)).toBe(label);
  });
});