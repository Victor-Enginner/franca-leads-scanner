# Scanner de Leads — Franca, SP

Ferramenta interna do engenheiro.ai: varre o Google Maps por nicho de
negócio em Franca/SP, calcula um score de oportunidade digital (site
ausente, só rede social, poucas avaliações) e organiza os leads num
dashboard com mensagem de abordagem pronta pra copiar e mandar manualmente.

Não faz envio automático de mensagem — de propósito. Ver `AGENTS.md`
pra entender por quê antes de "melhorar" isso.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (Postgres) — só a `service_role` key, usada server-side
- Tailwind CSS
- Three.js (globo 3D da interface "NEXUS SCAN")
- Google Places API (legacy: Text Search + Place Details, incl. geometry
  pra plotar os leads no globo)

## Rodar agora (modo demo, sem configurar nada)

Quer só ver funcionando primeiro? A app tem um **modo demo**: se o `.env`
não estiver configurado, ela roda com os 10 leads reais de Franca já
embutidos (`lib/seed-data.ts`). Dá pra filtrar por nicho/status, copiar
mensagem, mudar status — tudo funciona no navegador.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Um aviso no painel esquerdo indica que
você está no modo demo. O botão "Iniciar varredura" roda a sequência
cinematográfica completa (globo, fases, feed) sobre os leads embutidos —
mas é simulação: varredura de verdade precisa da Google Places API e de
um banco pra salvar (próxima seção). No demo, mudanças de status ficam
no localStorage do navegador.

## Setup local

1. **Supabase**: crie um projeto em [supabase.com](https://supabase.com),
   abra o SQL Editor e rode o conteúdo de `supabase/schema.sql`. Se você
   já tinha a tabela criada antes das colunas `lat`/`lon` existirem, rode
   só o bloco de migração no final do arquivo (`alter table ...`).
2. **Google Places API**: no
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   ative a "Places API" (legacy) e gere uma key. O Google dá USD 200/mês
   de crédito grátis, cobre uso normal desta ferramenta.
3. Copie `.env.example` para `.env` e preencha as 3 variáveis.
4. `npm install`
5. `npm run dev` e abra `http://localhost:3000`

## Deploy

1. Suba o repositório no GitHub.
2. Importe no [Vercel](https://vercel.com/new).
3. Configure as mesmas 3 variáveis de ambiente do `.env` no painel do
   Vercel (Settings → Environment Variables).
4. Deploy.

## Uso

1. No topo do dashboard, ajuste a lista de nichos (separados por vírgula)
   e clique em "Rodar varredura". Isso chama `/api/scan`, que busca cada
   nicho no Google Maps, calcula o score e salva no Supabase.
2. A tabela abaixo mostra os leads ordenados por score (maior = mais
   fácil de abrir conversa). Filtre por nicho ou status.
3. Clique em "copiar mensagem" pra pegar o rascunho pronto e cole no
   WhatsApp — manualmente, um de cada vez.
4. Depois de contatar, mude o status do lead (contatado / respondeu /
   fechado / sem interesse) pra manter o funil organizado.

## Nota de segurança

`npm audit` acusa vulnerabilidades conhecidas do Next.js 14.2.x que só
são totalmente corrigidas migrando pra Next 16 (mudança de major
version, fora de escopo do v1). São majoritariamente cenários de DoS
e XSS específicos de apps self-hosted com tráfego público — baixo risco
pra uma ferramenta pessoal de uso interno no Vercel. Se este projeto
crescer pra multiusuário ou tráfego público, faça essa migração antes.

## O que falta (de propósito, pra não inchar o v1)

- Autenticação — hoje é uso pessoal single-user, sem login.
- Geração de mensagem via Claude API em vez de template fixo (fase 2 —
  ver seção "Próximos passos" no `AGENTS.md`).
- Paginação na tabela (só importa depois de ~500+ leads).
