# Especificação de Produto — Weather App

## Overview

O Weather App permitirá pesquisar uma cidade e consultar temperatura e condição meteorológica atuais, além da previsão diária para hoje e os quatro dias seguintes. A busca terá cobertura mundial conforme os dados do Open-Meteo. A interface será em português do Brasil, usará Celsius por padrão e permitirá alternar para Fahrenheit.

A aplicação usará os serviços de geocodificação e previsão do Open-Meteo, não exigirá autenticação, não usará geolocalização do dispositivo e não armazenará consultas ou preferências entre carregamentos da página. Esta especificação define a baseline do produto; as confirmações externas necessárias ao lançamento estão listadas em Open Questions.

## Functional Requirements

- **RF-01 — Buscar e selecionar cidade:** aceitar uma consulta não vazia de nome de cidade, removendo espaços no início e no fim sem remover acentos, apóstrofos ou hífens. Exibir até cinco resultados em ordem de relevância do provedor, com nome da cidade e região administrativa e país quando disponíveis. A seleção de um resultado inicia a consulta meteorológica para aquele local.
- **RF-02 — Consultar clima atual:** exibir para a cidade selecionada a temperatura atual e a condição meteorológica retornadas pelo Open-Meteo. Condições devem ser apresentadas em português do Brasil.
- **RF-03 — Consultar previsão de cinco dias:** exibir um resumo diário para hoje e os quatro dias seguintes, segundo o calendário local da cidade selecionada. Cada dia deve apresentar data, temperatura mínima, temperatura máxima, condição meteorológica em português do Brasil e probabilidade máxima de precipitação em porcentagem quando disponível.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit. Cada carregamento da página começa em Celsius; a escolha vale até a página ser recarregada. A unidade deve ser aplicada a todas as temperaturas atuais e previstas, sem alterar os dados, a cidade ou as datas.
- **RF-05 — Comunicar estados da consulta:** durante busca e carregamento meteorológico, indicar que a operação está em andamento. Em caso de erro recuperável, informar que os dados não foram obtidos e oferecer uma ação para tentar novamente. Não apresentar valores ausentes como zero nem dados antigos como atuais.

O uso em dispositivos móveis é coberto pelos requisitos não-funcionais de responsividade e compatibilidade.

## User Stories

- **US-01 (RF-01):** Como pessoa que planeja o dia, quero pesquisar e selecionar minha cidade para consultar o clima do local correto.
- **US-02 (RF-02):** Como pessoa que planeja o dia, quero ver as condições meteorológicas atuais da cidade selecionada para decidir como me preparar.
- **US-03 (RF-01):** Como pessoa que planeja uma viagem, quero pesquisar e selecionar a cidade de destino para consultar a previsão do lugar certo.
- **US-04 (RF-03):** Como pessoa que planeja uma viagem, quero ver a previsão para hoje e os quatro dias seguintes no destino para planejar as atividades da viagem.
- **US-05 (RF-03):** Como pessoa que pratica atividades ao ar livre, quero consultar a previsão de cinco dias para escolher quando realizar uma atividade.
- **US-06 (RF-04):** Como pessoa que pratica atividades ao ar livre e prefere Fahrenheit, quero alternar a unidade de temperatura para interpretar os dados na escala que uso.
- **US-07 (RF-05):** Como pessoa consultando o tempo, quero receber uma mensagem clara e poder tentar novamente quando a busca ou os dados meteorológicos falharem para não confundir erro com uma previsão válida.

## Acceptance Criteria

- **CA-01.1 (RF-01)**
	- **Given** a geocodificação retorna resultados de teste para `São Paulo`.
	- **When** a pessoa envia `  São Paulo  `.
	- **Then** a busca usa o texto `São Paulo` sem espaços externos nem perda de acentos e mostra os resultados recebidos.
- **CA-01.2 (RF-01)**
	- **Given** uma busca retorna `Porto, Portugal` e `Porto Alegre, Brasil` entre seus resultados.
	- **When** os resultados são exibidos.
	- **Then** cada opção mostra o nome da cidade e, quando disponíveis, região administrativa e país.
- **CA-01.3 (RF-01)**
	- **Given** o serviço de geocodificação responde com zero resultados.
	- **When** a busca termina.
	- **Then** a interface informa que não encontrou cidades, mantém a consulta editável e não inicia uma consulta meteorológica.
- **CA-01.4 (RF-01)**
	- **Given** o campo de busca está vazio ou contém somente espaços.
	- **When** a pessoa tenta enviar a busca.
	- **Then** a interface informa que uma cidade deve ser digitada e não envia uma solicitação de geocodificação.
- **CA-01.5 (RF-01)**
	- **Given** a busca apresenta pelo menos uma cidade selecionável.
	- **When** a pessoa seleciona uma cidade.
	- **Then** essa cidade passa a ser identificada como selecionada e o app carrega o clima atual e a previsão para ela.
- **CA-01.6 (RF-01)**
	- **Given** o provedor retorna seis resultados em ordem de relevância.
	- **When** os resultados da busca são apresentados.
	- **Then** são exibidos somente os cinco primeiros, na mesma ordem recebida.
- **CA-01.7 (RF-01)**
	- **Given** a geocodificação de teste retorna um resultado para `L'Haÿ-les-Roses`.
	- **When** a pessoa pesquisa `L'Haÿ-les-Roses`.
	- **Then** apóstrofo, hífen e caracteres acentuados são preservados na consulta e o resultado correspondente é exibido.
- **CA-02.1 (RF-02)**
	- **Given** `Lisboa` está selecionada, a unidade é Celsius e a resposta contém temperatura `18 °C` e condição `Chuva`.
	- **When** o carregamento é concluído.
	- **Then** a interface identifica `Lisboa` e apresenta `18 °C` e `Chuva` como dados atuais.
- **CA-02.2 (RF-02)**
	- **Given** `Lisboa` está selecionada e uma resposta de teste contém valores exclusivos para essa cidade.
	- **When** os dados atuais são apresentados.
	- **Then** a interface mostra os valores da resposta de `Lisboa` junto ao nome `Lisboa`.
- **CA-03.1 (RF-03)**
	- **Given** o relógio de teste está fixado em `2026-11-05` no fuso `America/Sao_Paulo` e há previsões diárias para cinco dias consecutivos.
	- **When** a previsão é carregada.
	- **Then** são exibidos os dias 5 a 9 de novembro de 2026, em ordem e no formato de data `DD/MM/AAAA`.
- **CA-03.2 (RF-03)**
	- **Given** uma previsão diária contém mínima `10 °C`, máxima `20 °C`, condição `Ensolarado` e probabilidade máxima de precipitação `60%`.
	- **When** a data correspondente é exibida em Celsius.
	- **Then** a linha do dia mostra `10 °C` como mínima, `20 °C` como máxima, `Ensolarado` como condição e `60%` como probabilidade de precipitação.
- **CA-04.1 (RF-04)**
	- **Given** a página é aberta ou recarregada e há temperaturas disponíveis.
	- **When** o conteúdo meteorológico é apresentado.
	- **Then** todas as temperaturas são exibidas em Celsius.
- **CA-04.2 (RF-04)**
	- **Given** as temperaturas visíveis são `20 °C` (atual), `10 °C` (mínima) e `25 °C` (máxima).
	- **When** a pessoa seleciona Fahrenheit.
	- **Then** os mesmos valores são exibidos como `68 °F`, `50 °F` e `77 °F`, respectivamente.
- **CA-04.3 (RF-04)**
	- **Given** a temperatura atual é `68 °F`, a mínima é `50 °F`, a máxima é `77 °F`, e a cidade e as cinco datas estão visíveis.
	- **When** a pessoa seleciona Celsius.
	- **Then** as temperaturas são exibidas como `20 °C`, `10 °C` e `25 °C`, mantendo a mesma cidade e as mesmas cinco datas.
- **CA-05.1 (RF-05)**
	- **Given** uma busca ou consulta meteorológica está em andamento.
	- **When** a solicitação começa.
	- **Then** a interface mostra um indicador de carregamento em até `100 ms`.
- **CA-05.2 (RF-05)**
	- **Given** o serviço retorna erro HTTP `503` para uma consulta meteorológica.
	- **When** a resposta de erro é recebida.
	- **Then** a interface mostra uma mensagem em pt-BR, mantém a cidade selecionada e oferece a ação `Tentar novamente`, sem exibir os dados anteriores como atuais.
- **CA-05.3 (RF-05)**
	- **Given** uma solicitação não recebe resposta em até `8 s`.
	- **When** o limite de tempo é atingido.
	- **Then** o carregamento termina, a interface informa que a solicitação expirou e oferece `Tentar novamente`.
- **CA-05.4 (RF-05)**
	- **Given** a resposta atual não contém temperatura ou condição, mas a previsão é válida.
	- **When** os dados são apresentados.
	- **Then** o bloco de clima atual informa que está indisponível e a previsão válida continua visível; nenhum campo ausente é substituído por zero.
- **CA-05.5 (RF-05)**
	- **Given** um dos cinco dias não contém mínima, máxima ou condição, mas os outros dias são válidos.
	- **When** a previsão é apresentada.
	- **Then** o dia incompleto é identificado como indisponível e os demais dias são exibidos normalmente.
- **CA-05.6 (RF-05)**
	- **Given** uma resposta meteorológica válida foi recebida pelo app.
	- **When** a interface processa a resposta.
	- **Then** os dados são apresentados em até `1 s` após o recebimento.

## Traceability Matrix

| User Story | Requisito funcional | Acceptance Criteria | RNFs relevantes |
|---|---|---|---|
| **US-01 — Planejar o dia: buscar e selecionar cidade** | RF-01 | CA-01.1–CA-01.7 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07, RNF-08 |
| **US-02 — Planejar o dia: consultar clima atual** | RF-02 | CA-02.1–CA-02.2, CA-05.2–CA-05.4, CA-05.6 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07 |
| **US-03 — Planejar viagem: buscar e selecionar destino** | RF-01 | CA-01.1–CA-01.7 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07, RNF-08 |
| **US-04 — Planejar viagem: consultar previsão de cinco dias** | RF-03 | CA-01.5, CA-03.1–CA-03.2, CA-05.3, CA-05.5–CA-05.6 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07 |
| **US-05 — Atividade ao ar livre: consultar previsão** | RF-03 | CA-01.5, CA-03.1–CA-03.2, CA-05.3, CA-05.5–CA-05.6 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07 |
| **US-06 — Atividade ao ar livre: alternar unidade** | RF-04 | CA-04.1–CA-04.3 | RNF-01, RNF-02, RNF-03, RNF-07 |
| **US-07 — Recuperar-se de falhas de consulta** | RF-05 | CA-01.3–CA-01.4, CA-05.1–CA-05.6 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07 |

Os RNFs listados são restrições transversais para implementar e validar cada história; os critérios CA indicam os cenários funcionais diretamente associados.

## Non-Functional Requirements

- **RNF-01 — Idioma e formato:** toda a interface e as condições meteorológicas devem estar em pt-BR. Datas devem usar `DD/MM/AAAA`; temperaturas devem mostrar o símbolo da unidade.
- **RNF-02 — Responsividade:** os fluxos principais devem funcionar nas larguras de `320 px`, `768 px` e `1440 px`, sem rolagem horizontal nem controles cortados.
- **RNF-03 — Acessibilidade:** atender WCAG 2.2 nível AA. Todas as ações devem ser operáveis por teclado, ter nome acessível e foco visível; texto e controles devem cumprir os critérios de contraste AA.
- **RNF-04 — Desempenho percebido:** o indicador de carregamento deve aparecer em até `100 ms` após a ação. Após a resposta válida do provedor, os dados devem aparecer em até `1 s`.
- **RNF-05 — Timeout e resiliência:** solicitações sem resposta devem expirar em `8 s`; a interface deve permitir nova tentativa e não permanecer em carregamento indefinidamente.
- **RNF-06 — Disponibilidade do app:** meta inicial de disponibilidade mensal de `99,5%` para a interface hospedada, excluindo indisponibilidade do Open-Meteo e do dispositivo/rede do usuário. Falhas do provedor são tratadas pelos RF-05 e CA-05.
- **RNF-07 — Compatibilidade:** suportar as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari, incluindo Safari em iOS e Chrome em Android.
- **RNF-08 — Privacidade e transporte:** servir a aplicação por HTTPS; não exigir conta, coletar localização do dispositivo ou persistir buscas e preferências em servidor ou dispositivo. A consulta de cidade é enviada ao Open-Meteo para geocodificação.

## Edge Cases

- Busca vazia ou só com espaços: mostrar validação e não enviar a consulta.
- Cidade inexistente ou geocodificação sem resultados: mostrar estado “Nenhuma cidade encontrada”, permitir nova busca e não consultar a previsão.
- Acentos, apóstrofos e hífens no nome da cidade: preservá-los na consulta; por exemplo, `São Paulo` não pode ser reduzido a `Sao Paulo` pelo app.
- Dois ou mais locais com nomes semelhantes: apresentar contexto geográfico em cada resultado e exigir seleção explícita.
- Erro HTTP, limite de uso, falha de rede ou resposta inválida do provedor: mostrar erro recuperável, preservar a cidade selecionada e não apresentar dados anteriores como atuais.
- Timeout: encerrar a espera em `8 s` e habilitar nova tentativa.
- Resposta parcial: marcar como indisponível apenas o bloco ou dia afetado; manter visíveis as partes válidas.
- Troca de cidade durante o carregamento: descartar a resposta da cidade anterior e apresentar somente dados da cidade selecionada mais recentemente.
- Troca de unidade durante o carregamento: aplicar a unidade ativa quando os dados forem apresentados.
- Mudança de dia, fuso horário ou horário de verão: compor a sequência de datas usando o fuso local retornado para a cidade.
- Temperaturas negativas ou conversão entre unidades: aplicar a conversão correta, arredondar ao inteiro mais próximo e manter o símbolo da unidade correspondente.

## Assumptions

- A busca cobre cidades globalmente na medida em que estejam disponíveis no Open-Meteo e mostra até cinco resultados em ordem de relevância do provedor.
- Selecionar uma cidade inicia automaticamente o carregamento do clima atual e da previsão diária.
- O conjunto obrigatório de dados é temperatura e condição atuais; para cada dia, temperatura mínima, máxima e condição.
- “Hoje + quatro dias” usa o fuso local da cidade selecionada e a previsão é diária.
- Celsius é aplicado ao abrir ou recarregar a página; a escolha de unidade não persiste.
- O app não usa geolocalização e não salva favoritos, histórico ou preferências localmente.
- As metas `99,5%`, `100 ms`, `1 s`, `8 s`, os viewports e a matriz de navegadores são uma baseline proposta e devem ser aprovados pelo responsável do produto antes do lançamento.

## Risks

- **Dependência externa:** indisponibilidade, limites, mudanças de termos ou cobertura do Open-Meteo podem interromper buscas. Mitigação: validar condições de uso e monitorar erros e consumo antes/depois do lançamento.
- **Ambiguidade geográfica:** resultados homônimos podem levar a previsão do local incorreto. Mitigação: exigir contexto geográfico nos resultados e testar buscas ambíguas.
- **Datas locais:** diferenças de fuso ou horário de verão podem deslocar a previsão diária. Mitigação: usar o fuso do local selecionado e cobrir virada de dia e horário de verão com testes.
- **Dados parciais:** campos ausentes podem ser interpretados como valores reais. Mitigação: aplicar o comportamento de indisponibilidade por bloco/dia e testar respostas incompletas.
- **Metas operacionais não aprovadas:** limites de desempenho e disponibilidade propostos podem não refletir capacidade ou necessidade real. Mitigação: obter aprovação do responsável do produto e da operação antes do lançamento.

## Out of Scope

- Autenticação, contas de usuário e persistência de dados em servidor.
- Alertas meteorológicos, notificações e recomendações automatizadas.
- Mapas, radar meteorológico, qualidade do ar e dados históricos.
- Comparação simultânea de várias cidades.
- Suporte a idiomas além de pt-BR nesta versão.
- Aplicativos nativos para iOS ou Android; o requisito atual é acesso responsivo em dispositivos móveis.
- Favoritos, histórico de buscas e persistência de preferência de unidade.
- Geolocalização automática.

## Open Questions

- O responsável do produto aprova as metas de disponibilidade (`99,5%`), desempenho, viewports, navegadores e WCAG 2.2 AA antes do lançamento?
- Os termos, limites de uso, atribuição exigida, cobertura geográfica e frequência de atualização do Open-Meteo são aceitáveis para o lançamento?
- Existe requisito regulatório ou de privacidade adicional para enviar nomes de cidades ao Open-Meteo?
- Quais métricas de adoção e sucesso do produto serão acompanhadas após o lançamento?