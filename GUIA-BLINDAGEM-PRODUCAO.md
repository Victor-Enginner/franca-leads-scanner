# Sprint 0 — blindagem de produção

Esta etapa fecha o NEXUS SCAN para operação interna. Ela não ativa o produto
multiusuário e não altera o fluxo manual de WhatsApp.

## 1. Aplicar RLS no Supabase

No SQL Editor do projeto de **produção**, execute o conteúdo de
`supabase/migrations/20260710_sprint0_lockdown.sql`.

Isso bloqueia leituras e escritas diretas com as roles `anon` e
`authenticated`. As API routes do app seguem funcionando, porque a
`SUPABASE_SERVICE_ROLE_KEY` permanece exclusivamente no servidor.

## 2. Configurar o acesso no Vercel

Em **Settings → Environment Variables**, crie para `Production` e `Preview`:

| Variável | Valor |
| --- | --- |
| `APP_ACCESS_USERNAME` | nome interno do operador, por exemplo `operator` |
| `APP_ACCESS_PASSWORD` | senha longa, exclusiva e guardada no gerenciador de senhas |

Não use senha já reutilizada e não a inclua em commit, issue, log ou chat.

## 3. Publicar e validar

1. Faça deploy do commit da Sprint 0.
2. Abra o domínio em janela anônima: o navegador deve pedir usuário e senha.
3. Sem credenciais, `/`, `/api/leads` e `/api/scan` devem responder `401`.
4. Com credenciais, confira o dashboard e execute somente uma varredura de
   teste autorizada.
5. Confirme no Vercel que `APP_ACCESS_PASSWORD` está definida: sem ela, a
   aplicação bloqueia tudo em produção por segurança.

## Limite atual de varredura

Cada IP pode iniciar até cinco varreduras por hora. É uma contenção imediata
em memória; antes de abrir acesso para mais operadores, ela deve ser trocada
por rate limit compartilhado/durável.

## O que não fazer agora

- Não preencher `NEXT_PUBLIC_SUPABASE_URL` nem `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  em produção para liberar login.
- Não criar policies permissivas no Supabase.
- Não retirar o bloqueio por senha para "facilitar" o acesso.
- Não automatizar envio de mensagens pelo WhatsApp.
