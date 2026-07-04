# AGENTS.md — Scanner de Leads (Franca/SP)

Contexto pra qualquer agente (Windsurf, Cursor, Claude Code) continuando
este projeto.

## O que isso é

Ferramenta de prospecção pessoal do engenheiro.ai. Varre o Google Maps
por nicho em Franca/SP, pontua cada negócio por "maturidade digital"
(tem site? só rede social? poucas avaliações?) e organiza num dashboard
pra abordagem manual, personalizada, via WhatsApp.

## Regras que não devem ser removidas sem decisão explícita do dono

1. **Sem envio automático de mensagem.** O app gera e mostra a mensagem;
   quem envia é o humano, manualmente. Isso existe porque disparo em
   massa não solicitado bane número no WhatsApp e esbarra na LGPD. Se
   pedirem pra automatizar o envio, primeiro pergunte se é via WhatsApp
   Business API oficial com opt-in — não via automação de número pessoal.
2. **Sem scraping/varredura de sistemas de terceiros.** Só dados públicos
   via API oficial do Google (Places API). Nada de tentar acessar painel
   admin, sistema interno, ou qualquer coisa que exija autenticação que
   não é do usuário deste app.
3. **`SUPABASE_SERVICE_ROLE_KEY` nunca vai pro client.** Toda leitura/
   escrita no Supabase passa pelas API routes (`app/api/**`). Não crie um
   client Supabase novo em um componente `"use client"`.

## Arquitetura

- `app/api/scan/route.ts` — POST, roda a varredura (Places API → score →
  upsert no Supabase). Idempotente por `place_id`.
- `app/api/leads/route.ts` — GET, lista leads com filtros de query string.
- `app/api/leads/[id]/route.ts` — PATCH, atualiza status de um lead.
- `lib/places.ts` — wrapper fino da Google Places API (Text Search +
  Details). Sem dependência externa além de `fetch`.
- `lib/scoring.ts` — regra de score + templates de mensagem. Pura,
  sem I/O — fácil de testar isoladamente.
- `components/scanner/ScannerDashboard.tsx` — estado principal e
  orquestração da UI "NEXUS SCAN" (client component).
- `components/scanner/Globe.tsx` — globo 3D (Three.js, client-only, os
  leads são plotados nas colunas `lat`/`lon` reais).
- `components/scanner/ScanSequence.tsx` / `TargetFeed.tsx` /
  `TargetCard.tsx` / `FunnelTracker.tsx` / `SystemLog.tsx` — UI.
- No modo demo (sem `.env`), mudanças de status caem no localStorage;
  com Supabase configurado, cada ação faz PATCH em `/api/leads/[id]`.

## Próximos passos sugeridos (nesta ordem, um de cada vez)

1. Rodar em produção com os nichos reais por 1-2 semanas antes de
   adicionar qualquer coisa nova. O objetivo é fechar cliente, não
   deixar a ferramenta bonita.
2. Trocar os templates fixos de `lib/scoring.ts` por geração via Claude
   API (`ANTHROPIC_API_KEY`), usando os mesmos dados de `PlaceDetails`
   como contexto — mensagem mais natural, motivo de abordagem mais
   específico.
3. Adicionar um "modo mockup": ao marcar um lead como "respondeu",
   disparar geração de uma imagem/mockup do site ou grid de Instagram
   dele (Higgsfield ou Claude) como prova de conceito visual.
4. Só depois disso: autenticação, multiusuário, outros municípios.

**Se você (agente ou humano) sentir vontade de pular direto pro item 3
ou 4 antes do item 1 estar validado com clientes reais — pare.** Esse é
exatamente o padrão de começar muita coisa e não terminar nenhuma. A
ferramenta já está funcional. O gargalo agora é conversa com dono de
negócio, não código.
