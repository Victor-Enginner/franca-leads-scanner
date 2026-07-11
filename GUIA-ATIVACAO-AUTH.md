# Guia futuro: ativar o modo multiusuário (login + planos)

> **Não ative este guia durante a Sprint 0.** O banco foi bloqueado com RLS
> sem policies públicas para proteger a operação interna. A ativação de
> login, contas de clientes e planos só será segura na Sprint 4, depois de
> criar e testar policies por operador. Até lá, use apenas
> `APP_ACCESS_USERNAME` + `APP_ACCESS_PASSWORD` no Vercel.

O código do Sprint 2 fica **dormindo** até você ativar. Enquanto as duas
variáveis `NEXT_PUBLIC_*` não existirem, o app roda exatamente como
antes (single-user, sem login). Ative só quando quiser começar a vender
acesso. Siga NA ORDEM:

## 1. Rode as migrações no Supabase (SQL Editor)

Primeiro a do Sprint 1 (se ainda não rodou):

```sql
alter table leads add column if not exists cidade text;
update leads set cidade = 'Franca, SP' where cidade is null;
create index if not exists leads_cidade_idx on leads (cidade);
```

Depois a do Sprint 2 (⚠️ a partir daqui o modo antigo sem login não
salva mais varreduras — combine com o passo 2 no mesmo dia):

```sql
alter table leads add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table leads drop constraint if exists leads_place_id_key;
create unique index if not exists leads_user_place_idx on leads (user_id, place_id);
create index if not exists leads_user_idx on leads (user_id);

create table if not exists perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plano text not null default 'beta',
  varreduras_limite int not null default 10,
  varreduras_usadas int not null default 0,
  ciclo_inicio date not null default current_date,
  criado_em timestamptz not null default now()
);
```

## 2. Adicione as variáveis de ambiente

No `.env` local **e** no Vercel (Settings → Environment Variables):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | o mesmo valor de `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a chave **publishable** (`sb_publishable_...`) — Project Settings → API Keys. É pública por design, pode ir pro navegador |
| `ADMIN_TOKEN` | uma senha longa que só você conhece |

Depois: redeploy no Vercel (Deployments → ⋯ → Redeploy) e reinicie o
`npm run dev` local.

## 3. (Recomendado no beta) Desligue a confirmação de e-mail

Supabase → Authentication → Sign In / Providers → Email → desmarque
"Confirm email". Sem isso, cada cliente precisa clicar num link de
confirmação antes de logar.

## 4. Crie a SUA conta

Abra `/login` → aba "Criar acesso" → seu e-mail + senha. Você entra com
plano `beta` (10 varreduras/mês).

## 5. Adote os leads antigos (os 196 de Franca)

SQL Editor, trocando o e-mail pelo que você cadastrou:

```sql
update leads
  set user_id = (select id from auth.users where email = 'SEU_EMAIL')
  where user_id is null;
```

## 6. Dê plano ilimitado pra você mesmo

```sql
update perfis set plano = 'admin', varreduras_limite = 100000
  where email = 'SEU_EMAIL';
```

## 7. Liberar um cliente que pagou (Stripe/Kiwify)

O cliente cria a conta no `/login` primeiro. Depois você roda (PowerShell):

```powershell
Invoke-RestMethod -Uri "https://SEU-SITE.vercel.app/api/admin/liberar" `
  -Method Post -ContentType "application/json" `
  -Headers @{ "x-admin-token" = "SEU_ADMIN_TOKEN" } `
  -Body '{ "email": "cliente@exemplo.com", "plano": "pro", "limite": 100 }'
```

Sem pagar = conta fica no plano `beta` (10 varreduras/mês). Ajuste o
padrão em `lib/perfil.ts` se quiser outro limite de teste.

> Webhook automático do Stripe (liberar sem comando manual) entra no
> Sprint 3, quando você tiver as chaves live do Stripe.
