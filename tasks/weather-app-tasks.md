# Backlog de Tarefas — Weather App

As tarefas derivam de `plans/weather-app-plan.md` e rastreiam os requisitos da spec. A ordem segue as fases **Tipos → Funções puras → Services → Hook → Componentes → Integração → Testes → Hardening**. Dependências entre IDs são explícitas; tarefas sem dependência entre si podem ser paralelizadas dentro da fase.

## Entrega 1 — Tipos
## Rastreabilidade por requisito funcional

| Requisito da spec | Tarefas de implementação | Tarefas de teste/verificação | Cobertura |
|---|---|---|---|
| **RF-01 — Buscar e selecionar cidade** | T-05 geocodificação; T-07 hook; T-11 busca; T-16 integração | T-22 geocodificação; T-24 hook; T-28 busca; T-33 integração; T-34 fluxo E2E; T-35 falhas E2E | Completa: busca, seleção, limite/ordem, input vazio, zero resultados e cidades ambíguas têm critérios/testes. |
| **RF-02 — Consultar clima atual** | T-06 forecast; T-07 hook; T-12 clima atual; T-16 integração | T-23 forecast; T-24 hook; T-29 componente; T-33 integração; T-34 fluxo E2E | Completa: cidade, temperatura, condição pt-BR e dados parciais têm tarefas/testes. |
| **RF-03 — Consultar previsão de cinco dias** | T-03 datas; T-04 códigos WMO; T-06 forecast; T-07 hook; T-13 cartão; T-14 lista; T-16 integração | T-20 datas; T-21 códigos WMO; T-23 forecast; T-24 hook; T-30 cartão; T-31 lista; T-33 integração; T-34 fluxo E2E | Completa: cinco datas locais, ordem, mínimas/máximas, condição e resposta parcial são cobertas. |
| **RF-04 — Alternar unidade de temperatura** | T-02 conversão; T-07 hook; T-12 clima atual; T-13 cartão; T-15 controle; T-16 integração | T-19 conversão; T-24 hook; T-29 clima atual; T-30 cartão; T-32 controle; T-33 integração; T-34 fluxo E2E | Completa: Celsius inicial, conversão derivada, Fahrenheit em todos os valores e ausência de novo request têm critérios/testes. |
| **RF-05 — Comunicar estados da consulta** | T-06 forecast; T-07 hook; T-08 loading; T-09 vazio; T-10 erro; T-16 integração | T-23 forecast; T-24 hook; T-25 loading; T-26 vazio; T-27 erro; T-33 integração; T-35 falhas E2E | Completa: loading, vazio, erro/retry, timeout e resposta parcial são cobertos; serviços distinguem zero resultados de falha. |

Todos os requisitos funcionais RF-01 a RF-05 têm tarefas correspondentes. Não há requisito funcional sem implementação ou verificação planejada.

## Prioridade, tamanho e fatias de entrega

### Prioridade

| Prioridade | Significado | Tarefas |
|---|---|---|
| **P0** | Necessário para o MVP ou bloqueia lançamento seguro. | T-01–T-18, T-37–T-39 |
| **P1** | Evidência de qualidade e regressão necessária antes da entrega da respectiva fatia. | T-19–T-36 |
| **P2** | Melhoria adiável sem comprometer requisitos ou lançamento desta versão. | Nenhuma tarefa atual; o escopo restante é necessário à spec ou aos gates de lançamento. |

### Tamanho

Tamanho relativo: **P** = pequeno e autocontido; **M** = médio, com contrato/integração ou múltiplos cenários; **G** = grande, deve ser dividido antes de executar.

| Tamanho | Tarefas |
|---|---|
| **P** | T-01–T-04, T-08–T-10, T-12–T-15, T-19–T-21, T-25–T-27, T-29–T-32, T-38–T-39 |
| **M** | T-05–T-07, T-11, T-16–T-18, T-22–T-24, T-28, T-33–T-37 |
| **G** | Nenhuma. Se T-16 permanecer responsável por integrar busca, atual, previsão, unidade e todos os estados de uma vez, reclassificá-la como G e dividi-la antes de iniciar. |

### Sequência sugerida em fatias verticais

| Fatia | Valor visível | Tarefas principais | Saída verificável |
|---|---|---|---|
| **1. Buscar e consultar agora** | Busca, seleção de cidade e clima atual (RF-01/RF-02). | T-01–T-12, T-16–T-18; validar com T-22–T-24, T-28–T-29 e T-33. | A pessoa seleciona uma cidade e vê temperatura e condição atuais; inclui loading, vazio e erro. |
| **2. Planejar os próximos dias** | Previsão diária completa de cinco dias (RF-03). | T-13–T-14 e extensão da integração; validar com T-20–T-21, T-23, T-30–T-31 e T-34. | A tela da fatia 1 passa a mostrar hoje e os quatro dias seguintes, em ordem e no fuso local. |
| **3. Preferência de unidade** | Alternância Celsius/Fahrenheit sem nova consulta (RF-04). | T-02, T-15 e integração; validar com T-19, T-32–T-34. | Todos os valores atuais e previstos alternam unidade localmente. |
| **4. Pronto para lançamento** | Robustez, mobile, regressão e aprovações. | T-35–T-39. | Falhas, timeout, respostas parciais, viewports e gates verificados; termos do provedor e metas aprovados. |

**Ajuste de dependências recomendado:** hoje T-16 depende de T-07–T-15, o que impede entregar busca/clima atual antes de forecast e unidade. Para materializar a fatia 1, limitar T-16 à integração de busca e clima atual, e criar uma tarefa de integração posterior para adicionar previsão e unidade; manter testes E2E correspondentes a cada fatia.

## Entrega 1 — Tipos

### T-01 — Definir os tipos de domínio
- **Descrição:** declarar contratos compartilhados de cidade, clima atual, previsão, dados meteorológicos, unidade e erro.
- **Critérios de aceite:** exportar `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `Unit` e `WeatherError`; `Unit` é `"celsius" | "fahrenheit"`; temperaturas/campos meteorológicos potencialmente ausentes aceitam `null`; TypeScript strict compila.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** RF-01–RF-05.

## Entrega 2 — Funções puras

### T-02 — Implementar conversão de temperatura
- **Descrição:** implementar conversão Celsius/Fahrenheit e arredondamento da apresentação.
- **Critérios de aceite:** retorna `68` para `20 °C`, `50` para `10 °C`, `-40` para `-40 °C`, `69` para `20.4 °C` e `null` para entrada nula; não faz I/O nem altera argumentos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** RF-04, CA-04.1–CA-04.3.

### T-03 — Implementar formatação de datas
- **Descrição:** formatar datas locais para apresentação em pt-BR sem deslocamento de fuso.
- **Critérios de aceite:** `formatDate("2026-11-05")` retorna `"05/11/2026"`; a string é tratada como data de calendário, sem deslocamento pelo timezone local.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** RF-03, RNF-01, CA-03.1.

### T-04 — Implementar mapeamento de códigos WMO
- **Descrição:** mapear códigos meteorológicos conhecidos para descrições em pt-BR.
- **Critérios de aceite:** `getWeatherDescription(0)` retorna descrição não vazia em pt-BR; `getWeatherDescription(999)` retorna `null`; nenhuma entrada numérica lança exceção.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** RF-02, RF-03, RNF-01.

## Entrega 3 — Services

### T-05 — Implementar geocodificação
- **Descrição:** implementar `searchCities` e mapear respostas do Open-Meteo para `City`.
- **Critérios de aceite:** URL usa `/v1/search` com `count=5`, `language=pt`, `format=json`; consulta é apenas trimada e preserva `L'Haÿ-les-Roses`; limite de cinco mantém a ordem recebida; `results: []` retorna array vazio; erro HTTP/rede rejeita; `AbortSignal` cancela a chamada.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** RF-01, CA-01.1–CA-01.7.

### T-06 — Implementar serviço de forecast
- **Descrição:** implementar `getWeather` e mapear clima atual e cinco previsões para `WeatherData`.
- **Critérios de aceite:** URL inclui coordenadas, `current=temperature_2m,weather_code`, `daily=temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max`, `temperature_unit=celsius`, `timezone=auto` e `forecast_days=5`; cinco datas viram cinco `ForecastDay` em ordem; arrays alinham por índice; campos ausentes, inclusive probabilidade, viram `null`; unidades/estrutura inválidas geram erro tipado; `AbortSignal` cancela a chamada.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** RF-02, RF-03, RF-05, CA-02.1–CA-03.2, CA-05.4–CA-05.5.

## Entrega 4 — Hook de estado

### T-07 — Implementar orquestração no hook
- **Descrição:** criar `useWeather` para busca, seleção, carregamento, dados, unidade e erros.
- **Critérios de aceite:** busca e clima mantêm estados independentes; busca cobre `idle/loading/success/empty/error` e clima também `partial`; zero resultados define `empty`, erro define `error`; selecionar cidade chama `getWeather`; cidade nova invalida resposta anterior; alterar unidade não chama services.
- **Dependências:** T-01–T-06.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-01–RF-05, CA-01.3–CA-01.5, CA-04.1–CA-04.3, CA-05.1–CA-05.5.

## Entrega 5 — Componentes

### T-08 — Criar indicador de carregamento
- **Descrição:** criar estado visual acessível para operações em andamento.
- **Critérios de aceite:** renderiza texto `Carregando...` em elemento com `role="status"`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-05, CA-05.1.

### T-09 — Criar estado vazio
- **Descrição:** criar estado visual para geocoding válido sem resultados.
- **Critérios de aceite:** renderiza `Nenhuma cidade encontrada` com semântica de status.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-01, CA-01.3.

### T-10 — Criar estado de erro
- **Descrição:** criar componente de falha recuperável com ação de retry.
- **Critérios de aceite:** renderiza mensagem em pt-BR e controle acessível `Tentar novamente`; um clique chama o callback exatamente uma vez.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-05, CA-05.2–CA-05.3.

### T-11 — Criar busca e seleção de cidade
- **Descrição:** implementar input, lista de resultados e evento de seleção.
- **Critérios de aceite:** submit vazio não chama callback; mostra até cinco opções com contexto geográfico disponível; selecionar chama `onSelect` uma vez com o `City` correspondente; input/opções têm nomes acessíveis e suporte a teclado.
- **Dependências:** T-07, T-09.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-01, CA-01.1–CA-01.7, RNF-03.

### T-12 — Exibir clima atual
- **Descrição:** implementar o componente de temperatura e condição atuais.
- **Critérios de aceite:** fixture Lisboa com `18 °C` mostra nome, temperatura e descrição; temperatura `null` aparece indisponível e código `999` não oculta temperatura válida.
- **Dependências:** T-01–T-04.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-02, RF-04, CA-02.1–CA-02.2, CA-05.4.

### T-13 — Criar cartão de previsão diária
- **Descrição:** apresentar uma data e suas condições mínimas, máximas e meteorológicas.
- **Critérios de aceite:** cartão mostra rótulo do dia, máxima e mínima convertidas para a unidade selecionada, condição e probabilidade em porcentagem; probabilidade `null` aparece indisponível, sem ocultar os outros campos válidos.
- **Dependências:** T-01–T-04.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-03, RF-04, CA-03.1–CA-03.2, CA-05.5.

### T-14 — Criar lista de previsão
- **Descrição:** renderizar os cartões diários na ordem retornada.
- **Critérios de aceite:** fixture com cinco datas produz exatamente cinco cartões em ordem; um cartão parcial não remove os outros quatro.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-03, CA-03.1–CA-03.2, CA-05.5.

### T-15 — Criar alternância de unidade
- **Descrição:** implementar controle controlado para Celsius/Fahrenheit.
- **Critérios de aceite:** expõe opções acessíveis Celsius e Fahrenheit; selecionar cada uma chama `onChange` com exatamente `celsius` ou `fahrenheit`; não depende de service.
- **Dependências:** T-01, T-02, T-07.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-04, CA-04.1–CA-04.3, RNF-03.

## Entrega 6 — Integração

### T-16 — Compor o fluxo principal no App
- **Descrição:** integrar hook, busca, clima atual, previsão, unidade e estados de carregamento/erro/vazio.
- **Critérios de aceite:** selecionar fixture exibe dados da mesma cidade; loading, vazio e erro correspondem ao status do hook; retry aciona nova tentativa; resposta atrasada de outra cidade não aparece na tela.
- **Dependências:** T-07–T-15.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RF-01–RF-05, CA-01.1–CA-05.5.

### T-17 — Criar o bootstrap React
- **Descrição:** ligar o documento HTML ao ponto de entrada React.
- **Critérios de aceite:** `index.html` contém `#root`; `src/main.tsx` importa e monta o `App` criado em T-16; `pnpm build` conclui.
- **Dependências:** T-16.
- **Arquivos prováveis:** `index.html`, `src/main.tsx`.
- **Tipo:** Infra.
- **Rastreabilidade:** RNF-01, RNF-02.

### T-18 — Integrar estilos globais e tema
- **Descrição:** carregar Tailwind e os estilos globais da aplicação.
- **Critérios de aceite:** `src/main.tsx` importa `src/styles/index.css`; a folha contém as camadas Tailwind e `pnpm build` conclui.
- **Dependências:** T-17.
- **Arquivos prováveis:** `src/styles/index.css`, `src/main.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** RNF-02.

## Entrega 7 — Testes

### T-19 — Testar conversão de temperatura
- **Descrição:** cobrir a função de conversão com Vitest.
- **Critérios de aceite:** asserts verificam `20 °C → 68 °F`, `10 °C → 50 °F`, `-40 °C → -40 °F`, `20.4 °C → 69 °F` e `null → null`; suíte passa sem rede.
- **Dependências:** T-02, T-18.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-04.1–CA-04.3.

### T-20 — Testar formatação de datas
- **Descrição:** validar a formatação pt-BR com Vitest.
- **Critérios de aceite:** asserts verificam `2026-11-05 → 05/11/2026`, `2026-12-31 → 31/12/2026` e `2027-01-01 → 01/01/2027`; resultados iguais nos timezones UTC e America/Sao_Paulo.
- **Dependências:** T-03, T-18.
- **Arquivos prováveis:** `tests/unit/format.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-03.1, RNF-01.

### T-21 — Testar mapeamento de códigos WMO
- **Descrição:** testar códigos conhecidos e desconhecidos com Vitest.
- **Critérios de aceite:** código `0` retorna descrição não vazia, código `999` retorna `null` e nenhuma chamada de rede ocorre.
- **Dependências:** T-04, T-18.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** RF-02, RF-03.

### T-22 — Testar geocodificação
- **Descrição:** cobrir busca, mapeamento e falhas com `fetch` mockado.
- **Critérios de aceite:** verifica URL/parâmetros, Unicode, limite/ordem, mapeamento, `results: []`, HTTP 503/rede como rejeição e abort; nenhuma chamada externa ocorre.
- **Dependências:** T-05, T-18.
- **Arquivos prováveis:** `tests/unit/weatherService.geocoding.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-01.1–CA-01.7.

### T-23 — Testar serviço de forecast
- **Descrição:** cobrir parâmetros, mapeamento e falhas do forecast com `fetch` mockado.
- **Critérios de aceite:** fixtures verificam URL/parâmetros, incluindo `precipitation_probability_max`, e mapeiam cinco datas; probabilidade presente é copiada como porcentagem e ausente vira `null` sem deslocar índices; estrutura inválida, HTTP 503, JSON inválido e rede produzem erro tipado; relógio falso verifica timeout em `8 s`; `fetch` real nunca é chamado.
- **Dependências:** T-06, T-18.
- **Arquivos prováveis:** `tests/unit/weatherService.forecast.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-02.1–CA-03.2, CA-05.2–CA-05.5.

### T-24 — Testar o hook de estado
- **Descrição:** testar transições e coordenação dos serviços no `useWeather`.
- **Critérios de aceite:** verifica estados de busca e clima, zero resultados distinto de erro, seleção, resposta obsoleta ignorada, campos parciais `null` e alternância de unidade sem novas chamadas.
- **Dependências:** T-07, T-18.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** RF-01–RF-05, CA-01.3–CA-01.5, CA-04.1–CA-04.3, CA-05.1–CA-05.5.

### T-25 — Testar indicador de carregamento
- **Descrição:** validar conteúdo e semântica do estado loading.
- **Critérios de aceite:** Testing Library encontra `Carregando...` dentro de `role="status"`.
- **Dependências:** T-08, T-18.
- **Arquivos prováveis:** `tests/unit/LoadingState.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-05.1, RNF-03.

### T-26 — Testar estado vazio
- **Descrição:** validar mensagem apresentada sem resultados.
- **Critérios de aceite:** Testing Library encontra `Nenhuma cidade encontrada` com semântica de status.
- **Dependências:** T-09, T-18.
- **Arquivos prováveis:** `tests/unit/EmptyState.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-01.3.

### T-27 — Testar estado de erro
- **Descrição:** validar mensagem e ação de retry.
- **Critérios de aceite:** Testing Library encontra mensagem em pt-BR e botão `Tentar novamente`; um clique chama callback exatamente uma vez.
- **Dependências:** T-10, T-18.
- **Arquivos prováveis:** `tests/unit/ErrorState.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-05.2–CA-05.3, RNF-03.

### T-28 — Testar busca e seleção de cidade
- **Descrição:** cobrir comportamento e acessibilidade de `SearchBar`.
- **Critérios de aceite:** verifica nenhuma submissão para input vazio, opções Porto/Porto Alegre distinguíveis, seleção do objeto correto e navegação/seleção via teclado.
- **Dependências:** T-11, T-18.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-01.1–CA-01.7, RNF-03.

### T-29 — Testar componente de clima atual
- **Descrição:** cobrir exibição de clima completo e parcial.
- **Critérios de aceite:** Testing Library verifica cidade, `18 °C`, descrição localizada, valor `null` como indisponível e código desconhecido sem ocultar temperatura válida.
- **Dependências:** T-12, T-18.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-02.1–CA-02.2, CA-05.4.

### T-30 — Testar cartão de previsão
- **Descrição:** validar campos e estado parcial de um cartão diário.
- **Critérios de aceite:** fixture verifica rótulo do dia, mínima/máxima em Celsius e Fahrenheit, ícone/condição WMO, probabilidade como porcentagem e `null` marcado indisponível.
- **Dependências:** T-13, T-18.
- **Arquivos prováveis:** `tests/unit/ForecastCard.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-03.1–CA-03.2, CA-05.5.

### T-31 — Testar lista de previsão
- **Descrição:** validar quantidade e ordenação dos dias exibidos.
- **Critérios de aceite:** fixture de cinco dias produz cinco cartões na mesma ordem e mantém os dias válidos quando um cartão é parcial.
- **Dependências:** T-14, T-18.
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-03.1–CA-03.2, CA-05.5.

### T-32 — Testar alternância de unidade
- **Descrição:** testar seleção e acessibilidade do controle.
- **Critérios de aceite:** testes verificam opções Celsius/Fahrenheit, os valores emitidos, unidade selecionada e operação por teclado; nenhuma chamada de rede ocorre.
- **Dependências:** T-15, T-18.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** CA-04.1–CA-04.3, RNF-03.

### T-33 — Testar integração da aplicação
- **Descrição:** testar o fluxo combinado de `App` com services simulados.
- **Critérios de aceite:** teste percorre busca → seleção → clima/previsão; testes separados verificam loading, erro/retry, zero resultados e conversão para Fahrenheit sem aumentar chamadas HTTP.
- **Dependências:** T-16, T-18.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** todos os RFs, CA-01.1–CA-05.5.

### T-34 — Validar o fluxo principal com Playwright
- **Descrição:** testar o fluxo principal em desktop e mobile com endpoints interceptados.
- **Critérios de aceite:** em viewports desktop e `320 x 800`, fixtures interceptadas permitem buscar Lisboa, selecionar o resultado, ver clima e cinco datas, alternar para Fahrenheit e verificar valores convertidos; o tráfego não acessa domínios Open-Meteo.
- **Dependências:** T-16, T-33.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** US-01–US-06, CA-01.1–CA-04.3.

### T-35 — Validar falhas e retry com Playwright
- **Descrição:** cobrir estados vazios, erros, timeout e resposta obsoleta.
- **Critérios de aceite:** E2E verifica estado vazio para zero resultados, erro para HTTP 503, timeout aos 8 s, recuperação após retry e ausência de resposta atrasada da primeira cidade após selecionar a segunda.
- **Dependências:** T-16, T-33.
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** US-07, CA-01.3–CA-01.4, CA-05.1–CA-05.5.

### T-36 — Validar viewport mobile e responsividade
- **Descrição:** verificar fluxo principal e overflow nos viewports definidos.
- **Critérios de aceite:** Playwright executa em `320 x 800`, `768 x 1024` e `1440 x 900`; em cada viewport `scrollWidth <= clientWidth`; em 320 px busca, seleção, previsão e unidade permanecem utilizáveis por teclado.
- **Dependências:** T-16, T-33.
- **Arquivos prováveis:** `tests/e2e/weather-responsive.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** RNF-02, RNF-03, RNF-07.

## Entrega 8 — Hardening

### T-37 — Executar gates integrados
- **Descrição:** validar build, lint e suítes após concluir implementação e testes.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` retornam exit code `0`; Vitest e Playwright não reportam testes falhos.
- **Dependências:** T-19–T-36.
- **Arquivos prováveis:** nenhum arquivo obrigatório; configurações existentes apenas se uma falha exigir ajuste.
- **Tipo:** Test.
- **Rastreabilidade:** todos os RFs e RNFs aplicáveis.

### T-38 — Validar condições de uso do Open-Meteo
- **Descrição:** confirmar limites, cobertura, atualização, termos e atribuição exigida pelo provedor.
- **Critérios de aceite:** aprovação ou impedimento de uso fica registrado nos documentos de produto antes do lançamento; qualquer impedimento tem decisão de resolução documentada.
- **Dependências:** T-37.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Tipo:** Infra.
- **Rastreabilidade:** RF-01–RF-03; risco de dependência externa.

### T-39 — Aprovar metas operacionais e acessibilidade
- **Descrição:** obter aprovação dos alvos propostos de desempenho, disponibilidade, compatibilidade e WCAG.
- **Critérios de aceite:** produto/operação registra aprovação ou valores revisados para `99,5%`, `100 ms`, `1 s`, `8 s`, viewports, navegadores e WCAG 2.2 AA antes do lançamento.
- **Dependências:** T-38.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Tipo:** Infra.
- **Rastreabilidade:** RNF-02–RNF-07; risco de metas operacionais não aprovadas.