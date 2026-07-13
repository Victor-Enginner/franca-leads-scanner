# Plano mestre de produção — NEXUS SCAN

**Decisão do responsável:** evoluir o produto de forma contínua, com validação
interna automatizada. A ativação pública de multiusuário e pagamentos continua
dependente de credenciais, política comercial e operação real.

## Guardrails permanentes

- [x] Mensagens de WhatsApp continuam humanas, revisadas e enviadas manualmente.
- [x] Google Places permanece a única fonte de dados de negócios.
- [x] `SUPABASE_SERVICE_ROLE_KEY` permanece somente no servidor.
- [x] RLS e segredos de servidor permanecem protegidos; o painel é público
  por decisão do responsável.
- [ ] Nenhuma falha de produção pode ser mascarada como modo demo.

## Sprint 2 — Jornadas e CRM operacional

**Objetivo:** cada dia de trabalho começa em uma jornada limpa; varreduras e
leads anteriores continuam consultáveis.

- [ ] Criar jornadas de até 12 horas, varreduras e vínculo histórico com leads.
- [ ] Migrar a base atual para uma jornada histórica arquivada.
- [ ] Retornar somente os leads da jornada atual por padrão.
- [ ] Registrar próxima ação, motivo de perda, origem e atividade comercial.
- [ ] Adicionar paginação, filtros server-side e CSV seguro.
- [ ] Criar estado vazio e histórico de jornadas no dashboard.

## Sprint 3 — Personalização segura

**Objetivo:** melhorar a sugestão de abordagem sem automatizar disparos.

- [ ] Validar e normalizar dados enviados ao gerador de mensagem.
- [ ] Proteger consultas de site contra destinos internos e redirecionamentos inseguros.
- [ ] Manter fallback determinístico quando a IA estiver indisponível.
- [ ] Exigir revisão humana antes de copiar ou abrir WhatsApp.
- [ ] Medir desempenho de template por nicho e tipo de oportunidade.

## Sprint 4 — Multiusuário preparado, não ativado publicamente

**Objetivo:** deixar o código e as migrations prontos para isolamento por
operador, sem abrir cadastro ou expor dados.

- [ ] Criar RLS por `user_id` para tabelas novas e existentes.
- [ ] Tornar consumo de cota atômico.
- [ ] Criar papel admin e registro de ações administrativas.
- [ ] Documentar allowlist/convite e a ativação segura do Supabase Auth.
- [ ] Manter o modo atual de operador único como padrão até liberação explícita.

## Sprint 5 — Qualidade, atualização e entrega

**Objetivo:** reduzir regressões e manter o deploy observável.

- [ ] Ampliar testes unitários e de integração das APIs críticas.
- [ ] Configurar CI para typecheck, testes, build e `npm audit`.
- [ ] Atualizar dependências de forma controlada e documentar compatibilidade.
- [ ] Adicionar healthcheck, logs de erro seguros e guia de rollback.
- [ ] Validar acessibilidade, estados vazios, falhas de rede e responsividade.

## Itens deliberadamente não ativados

- Integração real de Stripe, planos públicos e cobrança: exige conta, produtos,
  chaves e política comercial do responsável.
- Cadastro aberto e convite de terceiros: exige decisão de quem pode acessar a
  base e política de retenção de dados.
