import { expect, test, type Page } from "@playwright/test";

const city = {
  id: 2267057,
  name: "Lisboa",
  latitude: 38.7167,
  longitude: -9.1333,
  admin1: "Lisboa",
  country: "Portugal",
  country_code: "PT",
  timezone: "Europe/Lisbon",
};

const forecast = {
  timezone: "Europe/Lisbon",
  current: {
    time: "2026-11-05T12:00",
    temperature_2m: 0,
    weather_code: 0,
    relative_humidity_2m: 70,
    wind_speed_10m: 8,
    precipitation: 0,
    surface_pressure: 1015,
  },
  daily: {
    time: [
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
      "2026-11-09",
    ],
    temperature_2m_min: [0, 1, 2, 3, 4],
    temperature_2m_max: [10, 11, 12, 13, 14],
    weather_code: [0, 1, 2, 3, 61],
    precipitation_probability_max: [0, 10, 20, 35, 60],
  },
};

async function blockUnmockedExternalRequests(page: Page) {
  await page.route("https://**/*", (route) => route.abort());
}

async function mockForecastApis(page: Page) {
  await blockUnmockedExternalRequests(page);
  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    await route.fulfill({ json: { results: [city] } });
  });
  await page.route("https://api.open-meteo.com/**", async (route) => {
    await route.fulfill({ json: forecast });
  });
}

async function searchLisbon(page: Page) {
  await page.getByRole("searchbox", { name: "Cidade" }).fill("Lisboa");
  await page.getByRole("button", { name: "Buscar" }).click();
}

test("busca a cidade, mostra o forecast e converte unidade", async ({ page }) => {
  await mockForecastApis(page);
  await page.goto("/");

  await searchLisbon(page);

  const currentWeather = page.getByRole("article", { name: "Clima atual" });
  await expect(currentWeather.getByText("Lisboa, Portugal")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Previsão de 5 dias" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Fahrenheit" }).click();
  await expect(currentWeather.getByText("32 °F")).toBeVisible();
});

test("mostra estado vazio quando o geocoding não retorna results", async ({
  page,
}) => {
  await blockUnmockedExternalRequests(page);
  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    await route.fulfill({ json: {} });
  });
  await page.goto("/");

  await searchLisbon(page);

  await expect(
    page.getByRole("heading", { name: "Nenhuma cidade encontrada" }),
  ).toBeVisible();
});

test("recupera de falha HTTP no forecast após retry", async ({ page }) => {
  let forecastRequests = 0;
  await blockUnmockedExternalRequests(page);
  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    await route.fulfill({ json: { results: [city] } });
  });
  await page.route("https://api.open-meteo.com/**", async (route) => {
    forecastRequests += 1;
    if (forecastRequests === 1) {
      await route.fulfill({ status: 503, json: { error: true } });
      return;
    }
    await route.fulfill({ json: forecast });
  });
  await page.goto("/");

  await searchLisbon(page);
  await expect(page.getByRole("alert")).toContainText("HTTP 503");
  await page.getByRole("button", { name: "Tentar novamente" }).click();

  await expect(page.getByRole("heading", { name: "Clima atual" })).toBeVisible();
  expect(forecastRequests).toBe(2);
});

test("mantém o forecast quando os dados atuais são parciais", async ({ page }) => {
  await blockUnmockedExternalRequests(page);
  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    await route.fulfill({ json: { results: [city] } });
  });
  await page.route("https://api.open-meteo.com/**", async (route) => {
    await route.fulfill({
      json: {
        ...forecast,
        current: {
          ...forecast.current,
          temperature_2m: null,
          weather_code: null,
        },
      },
    });
  });
  await page.goto("/");

  await searchLisbon(page);

  const currentWeather = page.getByRole("article", { name: "Clima atual" });
  await expect(currentWeather.getByText("Indisponível")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Previsão de 5 dias" })).toBeVisible();
  await expect(page.getByText("10 °C")).toBeVisible();
});

test("renderiza o fluxo principal em viewport mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockForecastApis(page);
  await page.goto("/");

  await searchLisbon(page);

  const currentWeather = page.getByRole("article", { name: "Clima atual" });
  await expect(currentWeather.getByText("Lisboa, Portugal")).toBeVisible();
  await expect(currentWeather.getByText("0 °C")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Previsão de 5 dias" }),
  ).toBeVisible();
  await expect(page.getByText("32 °F")).toHaveCount(0);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("mantém o fluxo principal sem overflow nos viewports da spec", async ({
  page,
}) => {
  await mockForecastApis(page);

  for (const viewport of [
    { width: 320, height: 800 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await searchLisbon(page);
    await expect(page.getByRole("heading", { name: "Clima atual" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Previsão de 5 dias" }),
    ).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  }
});