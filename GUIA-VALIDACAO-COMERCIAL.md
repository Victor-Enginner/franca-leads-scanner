# Sprint 1 — validação comercial controlada

Comece este período somente depois de concluir a ativação da Sprint 0 no
Vercel e no Supabase. O objetivo não é aumentar o produto: é descobrir se o
NEXUS SCAN gera conversas qualificadas e clientes.

Antes de publicar o código desta Sprint, rode também
`supabase/migrations/20260710_sprint1_commercial_integrity.sql` no SQL Editor
de produção. Essa migration cria a data de último contato usada pelo Kanban.

## Duração e escopo

- Duração: 1 a 2 semanas úteis.
- Cidades: uma por vez, para medir qualidade.
- Nichos: no máximo 2 por ciclo de teste.
- Abordagens: humanas, individuais e revisadas antes do envio.
- Volume inicial: 10 a 20 novos contatos por dia, conforme capacidade real
  de resposta.

## Rotina por lead

1. Filtre alta prioridade e confirme se o negócio ainda opera.
2. Leia e ajuste a mensagem; a cidade deve estar correta.
3. Copie ou abra o WhatsApp manualmente.
4. O clique marca o lead como `contatado` e registra a data de contato.
5. Ao receber retorno, mova para `respondeu` e registre o contexto na nota.
6. Marque `fechado` apenas quando houver acordo comercial, não quando a
   mensagem foi enviada.

## Métricas diárias

Registre em planilha ou relatório:

| Data | Cidade/nicho | Contatos | Respostas | Reuniões | Propostas | Fechados | Tempo gasto |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |

## Critério para avançar

Após pelo menos 50 contatos qualificados, decidir com dados:

- taxa de resposta;
- reuniões por 50 contatos;
- nicho e mensagem com melhor retorno;
- tempo médio para produzir uma abordagem boa;
- objeções mais recorrentes.

Só depois dessa decisão faz sentido expandir CRM, IA ou acesso de clientes.
