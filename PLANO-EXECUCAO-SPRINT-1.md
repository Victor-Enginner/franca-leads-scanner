# Plano de execução — Sprint 1

**Objetivo:** validar se o NEXUS SCAN gera conversas qualificadas e clientes.

## Estado de preparação

- [x] Deploy protegido por autenticação de acesso.
- [x] RLS ativo na tabela `leads`; acesso direto de `anon` e `authenticated` bloqueado.
- [x] Campo `ultimo_contato_em` e índice de acompanhamento criados.
- [x] Testes automatizados e build de produção aprovados.
- [x] Mensagens permanecem manuais; não há envio automático por WhatsApp.
- [ ] Definir os dois nichos do primeiro ciclo.
- [ ] Executar a primeira varredura produtiva.

## Regras do ciclo

- Duração: 1 a 2 semanas úteis.
- Uma cidade por ciclo: **Franca/SP** no primeiro ciclo.
- Até dois nichos por ciclo.
- Meta inicial: 10 a 20 novos contatos qualificados por dia, respeitando a
  capacidade real de resposta.
- Toda abordagem deve ser revisada e enviada manualmente pelo operador.

## Roteiro diário

### Abertura

- [ ] Confirmar os nichos ativos e a cidade.
- [ ] Iniciar uma varredura somente quando houver capacidade para tratar os
  resultados.
- [ ] Filtrar leads por alta prioridade.

### Qualificação e contato

- [ ] Confirmar se o negócio ainda opera e se a cidade está correta.
- [ ] Ler o motivo do score e adaptar a mensagem ao negócio.
- [ ] Abordar manualmente somente leads com contexto suficiente.
- [ ] Registrar `contatado` ao iniciar a conversa.
- [ ] Registrar `respondeu` e adicionar contexto quando houver retorno.
- [ ] Marcar `fechado` somente com acordo comercial confirmado.

### Encerramento

- [ ] Registrar métricas do dia.
- [ ] Anotar objeções recorrentes e ajustes de mensagem.
- [ ] Separar follow-ups pela data de último contato, não pela data da varredura.

## Métricas obrigatórias

Use [REGISTRO-METRICAS-SPRINT-1.csv](./REGISTRO-METRICAS-SPRINT-1.csv) como
registro oficial: uma linha por dia, cidade e nicho. Ele permite calcular
taxa de resposta, reuniões por 50 contatos e tempo real de prospecção.

| Data | Cidade/nicho | Contatos | Respostas | Reuniões | Propostas | Fechados | Tempo gasto | Objeções |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| | | | | | | | | |

## Decisão ao encerrar a Sprint 1

Somente depois de **50 contatos qualificados**, responder com dados:

1. Qual nicho respondeu melhor?
2. Qual mensagem levou mais a reuniões?
3. Qual é a taxa de resposta e de reunião?
4. Quanto tempo uma abordagem boa leva para ser preparada?
5. Quais objeções impedem o avanço?
6. Os problemas do documento UX/UI realmente bloquearam a operação?

Com essas respostas, priorizar uma única próxima sprint. Sem evidência, o
produto permanece focado na operação comercial atual.
