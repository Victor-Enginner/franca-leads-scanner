-- Rode isso no SQL Editor do seu projeto Supabase antes do primeiro deploy.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  place_id text unique not null,
  nicho text not null,
  nome text not null,
  endereco text,
  telefone text,
  site text,
  rating numeric,
  qtd_reviews integer,
  score_oportunidade integer not null default 0,
  motivo_abordagem text not null default 'geral',
  mensagem_sugerida text not null default '',
  status text not null default 'não contatado',
  lat numeric,
  lon numeric,
  cidade text,
  notas text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists leads_score_idx on leads (score_oportunidade desc);
create index if not exists leads_nicho_idx on leads (nicho);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_cidade_idx on leads (cidade);

-- Atualiza atualizado_em automaticamente a cada UPDATE.
create or replace function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_atualizado_em on leads;
create trigger leads_set_atualizado_em
  before update on leads
  for each row
  execute function set_atualizado_em();

-- Migração: se você criou a tabela antes das colunas de coordenada
-- existirem, rode só estas duas linhas no SQL Editor:
alter table leads add column if not exists lat numeric;
alter table leads add column if not exists lon numeric;

-- Migração Sprint 1 (varredura multi-cidade): rode estas três linhas.
alter table leads add column if not exists cidade text;
update leads set cidade = 'Franca, SP' where cidade is null;
create index if not exists leads_cidade_idx on leads (cidade);

-- Migração Sprint 4 (CRM): anotações por lead. Rode esta linha.
alter table leads add column if not exists notas text;

-- ============================================================
-- Migração Sprint 2 (multiusuário) — RODE SOMENTE quando for ativar o
-- login (junto com as envs NEXT_PUBLIC_*, ver GUIA-ATIVACAO-AUTH.md).
-- Depois deste bloco, o app antigo sem login não consegue mais salvar
-- varreduras (a unicidade de place_id passa a ser por usuário).
-- ============================================================
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

-- Passo final (depois de criar SUA conta no /login): adote os leads
-- antigos trocando SEU_EMAIL pelo e-mail que você cadastrou.
-- update leads
--   set user_id = (select id from auth.users where email = 'SEU_EMAIL')
--   where user_id is null;

-- RLS fica desligado de propósito: esta é uma ferramenta de uso pessoal,
-- e todo acesso passa pelas API routes do Next.js usando a service_role
-- key (nunca exposta ao navegador). Se um dia isso virar multiusuário,
-- ligue RLS e adicione policies antes de expor a anon key no cliente.
