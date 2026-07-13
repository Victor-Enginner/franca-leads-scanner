# Sprint 0 — blindagem de produção (registro histórico)

Esta etapa bloqueou o acesso do NEXUS SCAN para operação interna. Ela não
ativa o produto multiusuário e não altera o fluxo manual de WhatsApp.

> **Status em julho de 2026:** a proteção por usuário e senha foi removida por
> decisão explícita do responsável para tornar o painel acessível via link.
> RLS, chaves exclusivas do servidor e o limite de varredura continuam ativos.

## 1. Aplicar RLS no Supabase

No SQL Editor do projeto de **produção**, execute o conteúdo de
`supabase/migrations/20260710_sprint0_lockdown.sql`.

Isso bloqueia leituras e escritas diretas com as roles `anon` e
`authenticated`. As API routes do app seguem funcionando, porque a
`SUPABASE_SERVICE_ROLE_KEY` permanece exclusivamente no servidor.

## 2. Acesso público por link

O middleware de credenciais foi removido. As variáveis
`APP_ACCESS_USERNAME` e `APP_ACCESS_PASSWORD` não são mais usadas e podem ser
removidas do Vercel. Não remova as variáveis de Google Places ou Supabase:
elas seguem somente no servidor.

## 3. Publicar e validar

1. Faça deploy do commit que remove o middleware.
2. Abra o domínio em uma janela anônima: o dashboard deve carregar sem pedir
   credenciais.
3. Confirme que as chaves não aparecem no código-fonte do navegador.
4. Execute somente varreduras necessárias: o limite atual é de cinco por IP
   por hora.

## Limite atual de varredura

Cada IP pode iniciar até cinco varreduras por hora. É uma contenção imediata
em memória; antes de abrir acesso para mais operadores, ela deve ser trocada
por rate limit compartilhado/durável.

## O que não fazer agora

- Não preencher `NEXT_PUBLIC_SUPABASE_URL` nem `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  em produção para liberar login.
- Não criar policies permissivas no Supabase.
- Não automatizar envio de mensagens pelo WhatsApp.
