# Documento UX/UI Design — NEXUS SCAN

**Status:** auditoria inicial concluída  
**Escopo:** dashboard operacional de prospecção e funil comercial  
**Referência:** interface NEXUS SCAN em produção e fluxo comercial da Sprint 1

## Objetivo de design

Transformar o NEXUS SCAN em uma ferramenta que ajude o operador a tomar uma
decisão comercial por vez: configurar uma varredura, qualificar um lead e
fazer uma abordagem humana e personalizada.

A identidade "radar" pode permanecer como diferencial visual, mas nunca deve
esconder a próxima ação comercial.

## Diagnóstico de maturidade

**Maturidade UX atual: 5/10.**

O produto tem identidade visual consistente e uma boa percepção de ferramenta
especializada. A principal lacuna é hierarquia operacional: hoje o globo e a
telemetria competem com a lista de leads e com o fluxo de abordagem.

## Achados priorizados

| Prioridade | Achado | Problema e impacto | Direção de design |
| --- | --- | --- | --- |
| P0 | A lista de leads não é o foco central | O globo domina a atenção, embora a atividade de maior valor seja decidir quem abordar. Isso aumenta o tempo até a primeira ação. | Tornar "Leads prontos para abordar" o conteúdo central; deixar o globo secundário, recolhível ou contextual. |
| P0 | Próxima ação pouco explícita | Score e "sem site" não deixam claro o que o operador deve fazer. | Em cada lead, exibir o motivo do score em linguagem comercial e uma ação única: **Revisar e abordar**. |
| P0 | Varredura sem previsibilidade suficiente | Antes de iniciar, o usuário não vê claramente escopo, duração ou resultado esperado. | Exibir um resumo de varredura: cidade, nichos, limite estimado, progresso, conclusão e erros recuperáveis. |
| P0 | Legibilidade e contraste | Tipografia muito pequena, caixa alta e baixo contraste dificultam leitura e podem falhar WCAG AA. | Texto operacional de no mínimo 14 px, contraste AA e cor nunca como único indicador de estado. |
| P1 | Navegação orientada à estética | "Radar" e "Funil" são coerentes com a marca, porém menos claros que os nomes da tarefa. | Usar **Leads** e **Funil comercial**; "Radar" pode existir como elemento visual secundário. |
| P1 | Filtros pouco explicativos | Não fica evidente o que está filtrado, quantos itens restam ou como desfazer uma seleção. | Mostrar filtros ativos como chips removíveis e o contador atualizado de resultados. |
| P1 | Métricas sem ação associada | Totais pequenos e densos não respondem "o que faço hoje?". | Criar cartões clicáveis: "Para contatar hoje", "Aguardando resposta" e "Fechados". |
| P1 | Estados e erros pouco visíveis | O usuário precisa de confirmação inequívoca ao iniciar varredura, atualizar status ou falhar uma operação. | Aplicar feedback próximo à ação, texto claro, recuperação e preservação do contexto. |
| P1 | Acessibilidade do globo | O canvas não pode ser a única forma de entender localização ou estado dos leads. | Fornecer lista/tabela equivalente, suporte a teclado e preferência por movimento reduzido. |
| P2 | Telemetria decorativa em excesso | Rótulos como "SAT-LINK" e logs técnicos tornam a interface mais ruidosa para a tarefa comercial. | Manter a estética somente em detalhes; usar linguagem direta nas decisões e alertas. |
| P2 | Áreas interativas compactas | Abas, filtros e botões pequenos aumentam erros de clique e dificultam uso em telas menores. | Áreas de toque de pelo menos 44 × 44 px e painéis recolhíveis em telas estreitas. |

## Princípios obrigatórios para próximas mudanças

1. **Ação antes de decoração:** a próxima decisão comercial deve ser vista em
   menos de três segundos.
2. **Linguagem de negócio:** usar "contatar", "aguardando resposta" e
   "fechado"; reservar linguagem orbital para a marca, não para instruções.
3. **Um estado, uma mensagem:** carregar, sucesso, falha e vazio devem ter
   textos próprios e próximos da ação que os gerou.
4. **Acessível por padrão:** contraste WCAG AA, teclado, foco visível e
   alternativa textual para conteúdo visual.
5. **Sem automação de WhatsApp:** o sistema prepara a abordagem; o envio é
   sempre humano, manual e revisado.

## Backlog de UX — bloqueado até a evidência comercial

Estas mudanças são candidatas para a sprint posterior, mas **não devem ser
implementadas durante a validação atual**:

- Reorganização da hierarquia "Leads primeiro".
- Cards de lead com motivo do score e CTA principal.
- Estados de varredura mais claros.
- Ajustes de contraste, tipografia, foco e responsividade.
- Simplificação de rótulos e filtros do funil.

O desbloqueio depende de ao menos 50 contatos qualificados na Sprint 1 e de
evidência de que esses pontos atrasam ou impedem a operação comercial.

## Critério de sucesso UX

Uma pessoa operadora deve conseguir, sem orientação externa:

1. configurar uma varredura;
2. entender por que um lead é prioritário;
3. preparar uma abordagem manual;
4. registrar o resultado no funil; e
5. identificar o próximo follow-up.

