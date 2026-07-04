# PROMPT PARA CLAUDE CODE — Portar UI cyberpunk pro Next.js

Cole isso no Claude Code (`claude` no terminal, dentro da pasta do projeto),
ou salve como `TASK.md` na raiz e rode: `claude "leia TASK.md e execute"`.

---

## Contexto do projeto

Estou trabalhando no `franca-leads-scanner`, um app Next.js 14 (App Router)
+ TypeScript + Tailwind + Supabase que já existe e funciona. Ele varre o
Google Maps por nicho de negócio em Franca/SP, calcula um "score de
oportunidade digital" (sem site, só rede social, poucas avaliações) e
mostra os leads num dashboard pra prospecção manual via WhatsApp.

O app já tem:
- Backend funcional: `app/api/scan` (POST, roda a varredura via Google
  Places + salva no Supabase), `app/api/leads` (GET, lista), `app/api/leads/[id]`
  (PATCH, muda status).
- `lib/places.ts` (wrapper da Places API), `lib/scoring.ts` (score +
  templates de mensagem), `lib/supabase.ts` (client server-side),
  `lib/seed-data.ts` (10 leads reais de Franca pro "modo demo").
- Frontend atual (a substituir): `components/Dashboard.tsx`,
  `components/ScanPanel.tsx`, `components/LeadsTable.tsx` — funcional mas
  visualmente básico.
- Um "modo demo": quando o `.env` não está configurado, roda com os leads
  de `lib/seed-data.ts` sem exigir banco.

## O que eu quero que você faça

Substituir o frontend básico por uma interface cyberpunk / "scanner de
inteligência" cinematográfica, SEM quebrar o backend nem o modo demo.
Tenho um protótipo HTML standalone completo dessa interface (vou colar
abaixo / está em `prototipo-cyberpunk.html`). Ele usa Three.js pra um
globo 3D, uma sequência de escaneamento em fases, e um feed de alvos
acionável. Sua tarefa é traduzir esse protótipo pra componentes React/
Next reais, conectados ao backend que já existe.

### Requisitos funcionais (portar do protótipo)

1. **Globo 3D (Three.js)** girando no espaço que, ao iniciar a varredura,
   rotaciona e dá zoom até Franca (coordenadas -20.5386, -47.4008), com
   os leads plotados nas posições lat/lon reais deles como pontos
   pulsantes com feixe vertical, coloridos por prioridade (score ≥50 =
   amber, ≥25 = cyan, resto = cinza).
2. **Sequência de escaneamento em fases** (aquisição orbital → triangular
   setor → implantar malha → escanear alvos → completo), com legenda
   embaixo do globo e um terminal de log lateral com timestamps.
3. **Botão de pular** (skip) na animação, ativável por clique ou tecla Esc.
   Da segunda varredura em diante, a sequência roda ~3x mais rápido.
4. **Feed de alvos acionável**: cada lead é um card que expande ao clicar,
   mostrando a mensagem de WhatsApp pronta + botões "copiar", "whatsapp"
   (abre wa.me com a mensagem preenchida) e "feito".
5. **Funil de vendas** (Fila / Contatado / Respondeu) e o status de cada
   lead, persistido — no protótipo é localStorage, mas AQUI deve usar o
   backend real: o botão "whatsapp" faz PATCH `/api/leads/[id]` pra
   status "contatado", "feito" pra "fechado", etc. No modo demo (sem
   Supabase), pode cair no localStorage como fallback.
6. **Filtros ao vivo** no feed (Todos / Alta prioridade / Na fila).
7. **Som opcional** (WebAudio, toggle, começa mudo) — bip por alvo
   detectado.

### Requisitos técnicos (importante)

- Instale o Three.js como dependência real (`npm install three` +
  `npm install -D @types/three`), NÃO via CDN. Importe como módulo.
- O componente do globo precisa ser `"use client"` e só rodar Three.js
  no cliente (cuidado com SSR — use `useEffect`, cheque `typeof window`).
- Os dados dos leads devem vir do backend via `/api/leads` (fetch no
  client ou via props do server component `app/page.tsx`), NÃO
  hardcoded no componente. Os 10 leads de exemplo já estão em
  `lib/seed-data.ts` — reuse.
- Mantenha o modo demo funcionando: se não há Supabase, a UI ainda abre
  com os leads seed e as ações caem no localStorage.
- Preserve TODAS as regras do `AGENTS.md` (sem envio automático de
  mensagem, sem scraping de terceiros, service key nunca no client).
- Tailwind: adicione os tokens de cor do tema cyberpunk (void, cyan,
  magenta, amber, lime, etc.) no `tailwind.config.ts`. As fontes
  (Orbitron, Rajdhani, JetBrains Mono) via `next/font/google` no layout.
- Não quebre o `npm run build`. Rode o build ao final pra confirmar.

### Como quero que você trabalhe

1. Primeiro leia os arquivos existentes (`components/`, `lib/`,
   `app/page.tsx`, `AGENTS.md`, `tailwind.config.ts`) pra entender o
   que já tem antes de mudar qualquer coisa.
2. Me mostre um plano curto de quais arquivos vai criar/editar ANTES de
   sair codando. Espere eu aprovar.
3. Trabalhe em componentes separados e pequenos: sugiro
   `components/scanner/Globe.tsx`, `ScanSequence.tsx`, `TargetFeed.tsx`,
   `TargetCard.tsx`, `FunnelTracker.tsx`, `SystemLog.tsx`, e um
   `ScannerDashboard.tsx` que orquestra tudo.
4. Depois de cada componente grande, rode `npx tsc --noEmit` pra pegar
   erro de tipo cedo.
5. No final: `npm run build` e me diga se passou.

### Referência visual

O protótipo HTML completo com toda a interface, animação e lógica está
em `prototipo-cyberpunk.html` (coloque o arquivo na raiz do projeto
antes de rodar). Use ele como fonte de verdade pra o visual e o
comportamento — cores, tempos de animação, estrutura das fases,
markup dos cards. Só traduza pra React idiomático e conecte no backend
real em vez do localStorage/dados fixos.

---

## Regras de comportamento pra esta sessão

- Não faça envio automático de mensagem em massa. O app gera a mensagem;
  quem envia é o humano, um a um. (É regra do projeto, está no AGENTS.md.)
- Se em algum momento você achar que seria "mais fácil" hardcodar os
  leads no componente em vez de puxar do backend, NÃO faça — o ponto do
  projeto é a interface conectar no scanner real.
- Se algo no protótipo não fizer sentido em React (ex: manipulação
  direta de DOM), reescreva do jeito React (estado, refs), não force a
  tradução literal.
- Pare e me pergunte se precisar de decisão de produto (ex: "quer que a
  animação toque toda vez ou só na primeira sessão do dia?").
