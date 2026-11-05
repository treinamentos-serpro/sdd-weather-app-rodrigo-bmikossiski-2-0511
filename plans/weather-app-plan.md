# Plano Técnico — Weather App

## Architecture

SPA React sem backend próprio. A UI delega busca e carregamento ao hook `useWeather`; este usa `weatherService` para chamar Open-Meteo, validar as respostas e convertê-las para tipos de domínio. Funções puras formatam datas, convertem temperaturas e mapeiam códigos WMO para descrições em pt-BR.

```text
Componentes React -> useWeather -> weatherService -> Open-Meteo
       |                 |              |
       UI              estado     validação e mapeamento
```

O navegador chama os endpoints públicos diretamente com `fetch`. Não há autenticação, API key, serviço de backend, cache persistente ou armazenamento de preferências. Uma resposta de uma seleção anterior deve ser cancelada ou ignorada.

## Tech Stack

- **React 19 e TypeScript strict:** UI tipada e estado local, sem biblioteca externa de estado.
- **Vite 8:** desenvolvimento e build da SPA.
- **Tailwind CSS 3.4:** estilos e breakpoints responsivos já configurados no projeto.
- **Fetch nativo:** chamadas HTTP sem adicionar cliente de rede.
- **Vitest 4 e Testing Library:** testes unitários e de componentes.
- **Playwright 1.61:** fluxos E2E e validação em viewports definidos.
- **Biome 2.5:** lint e verificações de código.
- **Ambiente:** Node.js 22 ou superior e pnpm 11.8.

Essas tecnologias e versões correspondem ao `package.json` e às configurações atuais. Não adicionar dependências de runtime sem necessidade aprovada.

## Project Structure

Estrutura mínima proposta, seguindo as convenções do repositório:

```text
src/
  App.tsx
  main.tsx
  components/
    SearchBar.tsx
  O estado da experiência fica em `useWeather`, chamado uma vez por `App` e distribuído aos componentes por props. Não introduzir Redux, Context global ou persistência. A seleção, busca e unidade vivem pelo ciclo de vida da página, de acordo com a spec.
    ForecastList.tsx
  -- `query`: texto de busca, normalizado apenas com `trim` antes de enviar.
  -- `searchStatus`: `idle | loading | success | empty | error`. `empty` significa geocoding válido com zero resultados; campo vazio é validação local e não inicia busca.
  -- `cityOptions`: resultados de `searchCities`.
  -- `selectedCity`: local selecionado; nova seleção limpa `weatherData` anterior.
  -- `weatherStatus`: `idle | loading | success | partial | error`. `partial` representa resposta válida com um ou mais campos meteorológicos ausentes.
  -- `weatherData`: dados normalizados e temperaturas canônicas em Celsius.
  -- `unit`: `Unit`, inicia em `celsius` e não é persistida.
  -- `error`: `WeatherError` para falhas de serviço; erros não são representados como lista vazia.
  hooks/
  Busca e consulta meteorológica mantêm status independentes. Respostas atrasadas são canceladas com `AbortController` ou ignoradas por identificador da requisição ativa.
  services/
  **Conversão derivada:** armazenar e manter em estado somente temperaturas Celsius. Na renderização, passar cada valor não nulo a uma função pura `convertTemperature(valueC, unit)` e então formatar com o símbolo correspondente (`°C` ou `°F`). Trocar `unit` atualiza a UI localmente, não altera `weatherData` e não gera nova solicitação HTTP. Recarregar a página restaura Celsius conforme RF-04.
    weatherService.ts
  lib/
    format.ts
  - **Input vazio:** validar localmente, mostrar mensagem em pt-BR, manter `searchStatus=idle` e não chamar o geocoding.
  - **Geocoding sem resultados:** definir `searchStatus=empty`, manter a consulta editável e não chamar forecast. Uma resposta HTTP/rede inválida do geocoding é erro, não `empty`.
  - **Falha de rede:** definir o status da operação afetada como `error`, manter a cidade selecionada quando houver, informar que não foi possível conectar e oferecer `Tentar novamente`.
  - **Erro da API:** tratar respostas HTTP não-2xx e JSON malformado como `error`; manter a cidade selecionada, exibir mensagem pt-BR e retry manual. Não converter `429`, `5xx` ou resposta inválida em lista vazia. Não executar retries automáticos infinitos.
  - **Timeout:** após `8 s` sem resposta, abortar a solicitação, encerrar loading, mostrar mensagem de expiração e permitir retry manual.
  - **Resposta parcial:** aceitar apenas payload com estrutura principal válida; preservar todos os campos válidos e definir campos meteorológicos faltantes/não finitos como `null`. Usar `weatherStatus=partial`; mostrar indisponibilidade apenas no bloco atual ou dia afetado, sem substituir por zero.
  - **Resposta estruturalmente inválida:** se não for possível identificar cidade/fuso ou alinhar as datas diárias, tratar a consulta como `error` de resposta inválida em vez de montar dados potencialmente deslocados.
  - **Troca de cidade durante solicitação:** cancelar a requisição anterior ou ignorar sua resposta; nunca exibir seus dados sob a cidade nova.
  - **Dados anteriores:** limpar o snapshot ao iniciar uma seleção nova e não apresentar snapshot obsoleto como atual após falha.
  - **Desempenho observável:** mostrar loading em até `100 ms` e renderizar resposta válida em até `1 s` após recebimento, conforme os RNFs propostos.
    weatherService.test.ts
    temperature.test.ts
    weatherCodes.test.ts
    App.test.tsx
  e2e/
    weather.spec.ts
```

No workspace consultado, `src/` e `tests/` não estão presentes; essa é a árvore-alvo a criar. Reutilizar configurações existentes de Vite, Tailwind, Vitest, Playwright e Biome.

## Data Model

Modelo de domínio normalizado. Temperaturas são mantidas em Celsius; `Unit` representa apenas apresentação. Campos meteorológicos ausentes são `null`, nunca zero.

```ts
type Unit = "celsius" | "fahrenheit";

interface City {
  id?: number;
  name: string;
  administrativeArea?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface CurrentWeather {
  time: string;
  temperatureC: number | null;
  weatherCode: number | null;
}

interface ForecastDay {
  date: string; // YYYY-MM-DD no fuso local da cidade.
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  weatherCode: number | null;
  precipitationProbabilityPercent: number | null;
}

interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather | null;
  forecast: ForecastDay[];
}

type WeatherErrorKind = "network" | "timeout" | "http" | "invalid-response";

interface WeatherError {
  kind: WeatherErrorKind;
  retryable: boolean;
  statusCode?: number;
}
```

Contratos do serviço:

```ts
searchCities(query: string, signal?: AbortSignal): Promise<City[]>;
getWeather(city: City, signal?: AbortSignal): Promise<WeatherData>;
```

`weatherCode` preserva o código WMO original; a tradução para texto em pt-BR é responsabilidade de `weatherCodes.ts`. A previsão contém até cinco datas retornadas pelo serviço, e cada data deve ser preservada mesmo quando algum campo daquele dia estiver ausente.

## Data Flow

1. A pessoa envia uma consulta; o hook remove espaços externos sem remover acentos, apóstrofos ou hífens.
2. `searchCities` chama o endpoint de geocodificação. A UI apresenta no máximo cinco resultados na ordem recebida, com cidade, região e país quando disponíveis.
3. Selecionar uma cidade marca o local ativo, limpa o clima anterior e inicia uma consulta meteorológica.
4. `getWeather` solicita clima atual e cinco previsões diárias em Celsius, com `timezone=auto`.
5. O serviço valida o JSON e mapeia o objeto atual e os arrays paralelos diários para `WeatherData`.
6. A UI apresenta as cinco datas no formato pt-BR, condições traduzidas e temperaturas convertidas para a unidade selecionada.
7. Uma troca de cidade cancela a solicitação anterior ou invalida sua resposta; somente a seleção mais recente pode atualizar a interface.

## External APIs

### Geocoding — Open-Meteo

- **URL:** `https://geocoding-api.open-meteo.com/v1/search`
- **Parâmetros:** `name` com consulta sem espaços externos; `count=5`; `language=pt`; `format=json`.
- **Resposta resumida:**

```json
{
  "results": [
    {
      "id": 3448439,
      "name": "São Paulo",
      "latitude": -23.55,
      "longitude": -46.63,
      "country_code": "BR",
      "country": "Brasil",
      "admin1": "São Paulo",
      "timezone": "America/Sao_Paulo"
    }
  ]
}
```

Mapeamento: `id` -> `City.id`; `name` -> `name`; `admin1` -> `administrativeArea`; `country` -> `country`; `country_code` -> `countryCode`; latitude/longitude -> coordenadas; `timezone` -> fuso opcional. `results: []` significa busca sem resultados. Erro HTTP, rede ou timeout é erro, nunca lista vazia.

### Forecast — Open-Meteo

- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Parâmetros:** coordenadas selecionadas; `current=temperature_2m,weather_code`; `daily=temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max`; `temperature_unit=celsius`; `timezone=auto`; `forecast_days=5`.
- **Resposta resumida:**

```json
{
  "timezone": "America/Sao_Paulo",
  "current": {
    "time": "2026-11-05T12:00",
    "temperature_2m": 18.0,
    "weather_code": 61
  },
  "daily": {
    "time": ["2026-11-05", "2026-11-06"],
    "temperature_2m_min": [12.0, 13.0],
    "temperature_2m_max": [21.0, 22.0],
    "weather_code": [61, 3],
    "precipitation_probability_max": [60, 20]
  }
}
```

O exemplo inclui duas entradas diárias por brevidade; a chamada de produção solicita cinco. Mapeamento: resposta da geocodificação -> `WeatherData.city`; `timezone` -> `WeatherData.timezone`; `current.time`, `current.temperature_2m` e `current.weather_code` -> `CurrentWeather.time`, `temperatureC` e `weatherCode`; cada índice de `daily.time` cria um `ForecastDay`, alinhando nele os valores do mesmo índice dos outros arrays, inclusive `precipitation_probability_max` -> `precipitationProbabilityPercent`. Os arrays diários podem ser mais curtos em respostas resumidas/incompletas; campo ausente vira `null` sem deslocar os demais dias. Validar `current_units`/`daily_units` contra Celsius.

Antes do lançamento, validar termos de uso, limites, cobertura, frequência de atualização e eventual atribuição exigida pelo provedor.

## State Management

O estado da experiência fica em `useWeather`, chamado uma vez por `App` e distribuído aos componentes por props. Não introduzir Redux, Context global ou persistência; os valores vivem somente durante o carregamento atual da página.

- `query`: texto de busca, normalizado somente com `trim`.
- `searchStatus`: `idle | loading | success | empty | error`; `empty` representa resposta válida de geocoding sem resultados. Consulta em branco é validada localmente e não inicia busca.
- `cityOptions`: resultados de `searchCities`.
- `selectedCity`: cidade selecionada; nova seleção limpa os dados meteorológicos anteriores.
- `weatherStatus`: `idle | loading | success | partial | error`; `partial` representa resposta válida com campos meteorológicos ausentes.
- `weatherData`: dados normalizados, com temperaturas canônicas em Celsius.
- `unit`: `Unit`, inicializada em `celsius` e sem persistência.
- `error`: `WeatherError`; falhas de serviço não são representadas como lista vazia.

Busca e consulta meteorológica têm estados independentes. Cancelar com `AbortController` ou ignorar respostas obsoletas por identificador da requisição ativa.

**Conversão derivada:** manter temperaturas no estado somente em Celsius. Na renderização, aplicar uma função pura `convertTemperature(valueC, unit)` a cada valor não nulo e formatar com `°C` ou `°F`. Trocar `unit` atualiza a UI localmente, não altera `weatherData` e não gera nova solicitação HTTP. Recarregar a página restaura Celsius conforme RF-04.

## Error Handling

- **Input vazio:** validar localmente, mostrar mensagem em pt-BR e não chamar o geocoding.
- **Geocoding sem resultados:** definir `searchStatus=empty`, manter a consulta editável e não consultar forecast. Erro de rede/HTTP do geocoding define `searchStatus=error`, não `empty`.
- **Falha de rede:** definir o status da operação como `error`, manter a cidade selecionada quando houver, informar que não foi possível conectar e oferecer `Tentar novamente`.
- **Erro da API:** tratar HTTP não-2xx e JSON malformado como `error`; manter a cidade selecionada e oferecer retry manual. Não converter `429`, `5xx` ou resposta inválida em lista vazia; não fazer retry automático infinito.
- **Timeout:** após `8 s` sem resposta, abortar a solicitação, encerrar o loading, informar expiração e permitir retry manual.
- **Resposta parcial:** aceitar estrutura principal válida, preservar campos válidos e atribuir `null` a campos faltantes/não finitos. Definir `weatherStatus=partial` e marcar indisponível apenas o bloco atual ou dia afetado; nunca substituir ausentes por zero.
- **Resposta estruturalmente inválida:** se não for possível identificar o fuso ou alinhar datas diárias, tratar como `error` de resposta inválida em vez de montar dados potencialmente deslocados.
- **Troca de cidade durante solicitação:** cancelar ou ignorar a resposta anterior; nunca exibi-la sob a cidade nova.
- **Dados anteriores:** limpar o snapshot ao iniciar uma seleção nova e não apresentar snapshot obsoleto como atual após falha.
- **Desempenho observável:** mostrar loading em até `100 ms` e renderizar resposta válida em até `1 s` após recebimento, conforme os RNFs propostos.

## Testing Strategy

- **Funções puras (Vitest):** testar conversão `20 °C = 68 °F`, `10 °C = 50 °F`, `-40 °C = -40 °F`, valores negativos, arredondamento e valores nulos. Testar formatação `pt-BR` e códigos WMO conhecidos/desconhecidos. As funções não devem mutar seus argumentos.
- **Services (Vitest):** mockar `fetch`; verificar URL, parâmetros e encoding de acentos/apóstrofos/hífens, `count=5`, mapeamento dos payloads, arrays diários por índice e validação de unidades. Cobrir geocoding vazio separado de erro HTTP/rede, `429`/`5xx`, JSON inválido, campos ausentes, arrays inconsistentes e timeout de `8 s` com relógios falsos. Nenhum teste chama Open-Meteo real.
- **Hook e componentes (Vitest + Testing Library):** verificar transições `idle`, `loading`, `success`, `empty`, `partial` e `error`; busca vazia sem chamada, resultados ambíguos, seleção, loading/erro/vazio/sucesso, retry e resposta parcial. Verificar que alternar unidade converte todos os valores visíveis sem aumentar o número de chamadas HTTP. Testar teclado, nomes acessíveis e foco dos controles.
- **Playwright E2E:** interceptar os dois endpoints com fixtures determinísticas e cobrir o fluxo busca → seleção → clima atual e cinco dias → alternância Celsius/Fahrenheit. Cobrir sem resultados, erro e retry, timeout e troca rápida de cidade sem renderizar resposta obsoleta. Validar o fluxo principal em viewport mobile de `320 x 800` e ausência de rolagem horizontal; executar verificações responsivas em `320 px`, `768 px` e `1440 px`.
- **Acessibilidade e metas:** usar verificações automatizadas para semântica/navegação e revisão de contraste/WCAG 2.2 AA. Medir loading e renderização com relógio controlado, sem asserts dependentes da latência de rede real. Disponibilidade mensal é verificada no ambiente hospedado, não por teste unitário.
- **Gates:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e`.

## Risks & Trade-offs

- **Fetch direto do navegador vs. BFF/backend:** escolher fetch direto, pois o Open-Meteo não exige API key e o produto não requer autenticação nem dados persistentes. Evita infraestrutura e reduz complexidade; em troca, o cliente depende da rede/CORS, envia a busca ao provedor e não oferece cache central ou controle de quota. Um BFF só deve ser reavaliado se surgirem requisitos de cache, segredo, rate limiting ou privacidade que não possam ser atendidos no cliente.
- **Estado local em hook vs. Context/Redux:** escolher `useWeather` porque o estado pertence a um único fluxo/tela. Evita dependência e boilerplate; Context ou Redux seriam justificáveis apenas com múltiplas áreas que precisem compartilhar o estado.
- **Temperatura canônica em Celsius vs. pedir a unidade selecionada à API:** manter Celsius e converter na renderização. Evita requests ao alternar, mantém um único conjunto de dados e torna conversões testáveis como funções puras; requer consistência de arredondamento na apresentação.
- **Sem cache/persistência vs. Local Storage ou service worker:** não persistir, conforme a spec. Evita dados possivelmente desatualizados e gerenciamento de validade; recarregar exige nova busca e a unidade volta a Celsius.
- **Tratamento parcial vs. falhar a tela inteira:** exibir campos/dias válidos e marcar apenas os incompletos. Preserva informação útil, mas exige que cada bloco trate valores `null`.
- **Dependência Open-Meteo:** limites, cobertura, disponibilidade e termos podem mudar. Validar atribuição e condições de uso antes do lançamento; a meta de disponibilidade do app não cobre falhas do provedor.
- **Metas operacionais propostas:** `99,5%` de disponibilidade, `100 ms` para indicar carregamento, `1 s` para renderizar após resposta, timeout de `8 s`, viewports, navegadores e WCAG 2.2 AA requerem aprovação do produto/operação antes do lançamento.
- **Estrutura fonte ausente no workspace consultado:** `src/` e `tests/` precisam ser criados conforme a árvore deste plano; confirmar se a ausência é intencional antes de decompor tarefas.