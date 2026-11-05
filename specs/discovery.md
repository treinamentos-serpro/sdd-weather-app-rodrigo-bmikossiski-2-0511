# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa precisa de uma aplicação de previsão do tempo para que usuários consultem informações meteorológicas de cidades. A experiência deve permitir localizar uma cidade, consultar as condições atuais e visualizar a previsão dos próximos cinco dias. A aplicação também deve oferecer alternância entre Celsius e Fahrenheit e funcionar em dispositivos móveis.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e selecione o local desejado para consultar o clima.
- **RF-02 — Ver clima atual:** apresentar as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Ver previsão de cinco dias:** apresentar a previsão do tempo para os cinco dias seguintes à consulta.
- **RF-04 — Alternar unidades:** permitir alternar a exibição de temperatura entre Celsius e Fahrenheit.
- **RF-05 — Usar em dispositivos móveis:** disponibilizar as funcionalidades principais em dispositivos móveis.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** interface e conteúdo devem se adaptar a telas de dispositivos móveis.
- **RNF-02 — Usabilidade:** busca, consulta da previsão e alternância de unidades devem ser compreensíveis e acessíveis a partir da interface.
- **RNF-03 — Consistência de unidades:** as temperaturas exibidas devem corresponder à unidade selecionada.

> O briefing não estabelece metas mensuráveis de desempenho, disponibilidade, acessibilidade ou compatibilidade; esses critérios precisam ser definidos antes de serem tratados como requisitos verificáveis.

## Riscos

- **Ambiguidade na busca:** nomes de cidades podem se repetir ou corresponder a locais diferentes, levando à consulta do lugar errado.
- **Dependência de dados meteorológicos:** indisponibilidade, atraso ou dados incompletos do provedor podem impedir ou prejudicar a consulta.
- **Escopo de “cinco dias”:** pode haver interpretações diferentes sobre dias corridos, dias completos ou quantidade de períodos exibidos.
- **Experiência móvel insuficiente:** sem critérios de viewport e validação em dispositivos, a interface pode não funcionar bem em diferentes tamanhos de tela.
- **Conversão e apresentação:** alternância entre unidades pode produzir valores inconsistentes se não for aplicada a todas as temperaturas exibidas.

## Perguntas em Aberto

- A busca deve aceitar apenas cidades ou também bairros, regiões e coordenadas? Como o usuário distingue cidades homônimas?
- Qual fonte de dados meteorológicos deve ser utilizada e quais limites de uso, cobertura geográfica e atualização ela oferece?
- Quais informações compõem o “clima atual” e a previsão (por exemplo, temperatura, sensação térmica, condição, precipitação e vento)?
- A previsão de cinco dias deve ser diária ou incluir períodos intradiários? O dia atual conta como um dos cinco?
- A unidade escolhida deve persistir durante a sessão, entre visitas ou apenas enquanto a página estiver aberta?
- A aplicação deve detectar e exibir automaticamente a localização atual do usuário?
- Quais navegadores e tamanhos de tela devem ser suportados? Há requisitos específicos de acessibilidade?
- Quais são as metas de desempenho, disponibilidade e comportamento esperado quando não houver conexão ou os dados falharem?
- É necessário permitir salvar cidades favoritas ou consultar novamente buscas recentes?

## Suposições

- A consulta de clima acontece depois que o usuário pesquisa e seleciona uma cidade.
- Celsius e Fahrenheit se aplicam a todas as temperaturas meteorológicas exibidas.
- “Previsão de 5 dias” significa apresentar informações para cinco dias a partir da consulta; a granularidade e a inclusão do dia atual ainda precisam ser confirmadas.
- A experiência deve permitir o uso das funções principais em telas móveis, mas o briefing não exige funcionalidades exclusivas para dispositivos móveis.
- A aplicação depende de uma fonte externa ou serviço de dados meteorológicos, ainda a ser escolhido.
