# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa precisa de uma aplicação de previsão do tempo para que usuários consultem informações meteorológicas de cidades. A experiência deve permitir localizar uma cidade, consultar as condições atuais e visualizar a previsão para hoje e os quatro dias seguintes. A aplicação também deve oferecer alternância entre Celsius e Fahrenheit e funcionar em dispositivos móveis.

## Personas (hipóteses)

- **Quem planeja o dia:** quer saber se as condições atuais afetam deslocamentos e atividades cotidianas. Usa principalmente o celular antes de sair. Considera sucesso encontrar a cidade e entender as condições relevantes em menos de 30 segundos, sem repetir a busca.
- **Quem planeja uma viagem:** quer consultar o clima do destino nos próximos cinco dias antes ou durante a viagem. Usa desktop durante o planejamento e celular durante a viagem. Considera sucesso identificar a previsão dos dias da viagem e confirmar que ela corresponde ao destino escolhido.
- **Quem pratica atividades ao ar livre:** quer verificar as condições para decidir quando e como realizar atividades externas. Usa principalmente o celular, às vezes em movimento, e pode preferir Fahrenheit. Considera sucesso interpretar a previsão e a temperatura sem ambiguidade, na unidade de sua preferência.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e selecione o local desejado para consultar o clima.
- **RF-02 — Ver clima atual:** apresentar as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Ver previsão de cinco dias:** apresentar a previsão do tempo para hoje e os quatro dias seguintes à consulta.
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
- Quais limites de uso, cobertura geográfica e frequência de atualização o Open-Meteo oferece para os dados necessários?
- Quais informações compõem o “clima atual” e a previsão (por exemplo, temperatura, sensação térmica, condição, precipitação e vento)?
- A previsão de hoje e dos quatro dias seguintes deve ser diária ou incluir períodos intradiários?
- A unidade selecionada deve persistir entre visitas ou apenas enquanto a página estiver aberta? Celsius já está definido como padrão.
- A aplicação deve detectar e exibir automaticamente a localização atual do usuário?
- Quais navegadores e tamanhos de tela devem ser suportados? Há requisitos específicos de acessibilidade?
- Quais são as metas de desempenho, disponibilidade e comportamento esperado quando não houver conexão ou os dados falharem?
- É necessário salvar cidades favoritas ou buscas recentes localmente no dispositivo? Não haverá persistência em servidor.

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** Justificativa: adotar uma fonte concreta sem exigir gerenciamento de chave de API. Resolve a escolha do provedor; limites de uso, cobertura geográfica e frequência de atualização ainda precisam ser confirmados.
- **Período da previsão: hoje mais os quatro dias seguintes.** Justificativa: define um intervalo inequívoco de cinco dias, incluindo o dia da consulta. Resolve se hoje conta como um dos cinco; a granularidade diária ou intradiária continua em aberto.
- **Unidade padrão: Celsius.** Justificativa: estabelece uma apresentação inicial consistente com o idioma da interface. Resolve qual unidade mostrar antes de uma escolha do usuário; a persistência da preferência ainda está em aberto.
- **Sem autenticação e sem persistência em servidor.** Justificativa: manter o escopo simples e evitar contas e armazenamento de dados do usuário no backend. Resolve se haverá login e persistência server-side; favoritos ou buscas salvas localmente ainda precisam ser decididos.
- **Idioma da interface: pt-BR.** Justificativa: define o idioma inicial dos textos e controles da aplicação. Resolve a escolha do idioma da UI; suporte a outros idiomas não está incluído nesta decisão.

## Suposições

- A consulta de clima acontece depois que o usuário pesquisa e seleciona uma cidade.
- Celsius e Fahrenheit se aplicam a todas as temperaturas meteorológicas exibidas, com Celsius como unidade inicial.
- “Previsão de 5 dias” significa apresentar informações para hoje e os quatro dias seguintes; a granularidade ainda precisa ser definida.
- A experiência deve permitir o uso das funções principais em telas móveis, mas o briefing não exige funcionalidades exclusivas para dispositivos móveis.
- A aplicação depende do serviço externo Open-Meteo para obter dados meteorológicos.
