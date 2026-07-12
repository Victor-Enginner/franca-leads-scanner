-- Sprint 2 — jornadas de trabalho, varreduras e histórico de resultados.
-- Uma jornada dura até 12 horas. A próxima varredura após seu vencimento
-- cria uma nova jornada; os leads e o histórico comercial nunca são apagados.

begin;

create table if not exists public.jornadas_trabalho (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid references auth.users(id) on delete cascade,
  cidade text not null,
  iniciada_em timestamptz not null default now(),
  expira_em timestamptz not null default (now() + interval '12 hours'),
  encerrada_em timestamptz,
  origem text not null default 'operacao',
  criado_em timestamptz not null default now()
);

create index if not exists jornadas_operador_ativas_idx
  on public.jornadas_trabalho (operador_id, expira_em desc)
  where encerrada_em is null;
create index if not exists jornadas_iniciada_idx
  on public.jornadas_trabalho (iniciada_em desc);

create table if not exists public.varreduras (
  id uuid primary key default gen_random_uuid(),
  jornada_id uuid not null references public.jornadas_trabalho(id) on delete cascade,
  cidade text not null,
  nichos jsonb not null default '[]'::jsonb,
  max_por_nicho integer not null,
  estado text not null default 'executando'
    check (estado in ('executando', 'concluida', 'falhou')),
  encontrados integer not null default 0,
  salvos integer not null default 0,
  ignorados integer not null default 0,
  erros jsonb not null default '[]'::jsonb,
  iniciada_em timestamptz not null default now(),
  concluida_em timestamptz
);

create index if not exists varreduras_jornada_idx
  on public.varreduras (jornada_id, iniciada_em desc);

create table if not exists public.varredura_leads (
  varredura_id uuid not null references public.varreduras(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  score_na_varredura integer not null,
  motivo_na_varredura text not null,
  cidade_na_varredura text not null,
  status_na_entrada text not null,
  registrado_em timestamptz not null default now(),
  primary key (varredura_id, lead_id)
);

create index if not exists varredura_leads_lead_idx
  on public.varredura_leads (lead_id, registrado_em desc);

-- Preserva a base existente numa sessão histórica única, sem exibi-la como
-- jornada atual. A migration pode ser rodada mais de uma vez sem duplicar.
do $$
declare
  jornada_legado uuid;
  varredura_legado uuid;
begin
  if exists (select 1 from public.leads) then
    select id into jornada_legado
      from public.jornadas_trabalho
      where origem = 'legado'
      order by iniciada_em asc
      limit 1;

    if jornada_legado is null then
      insert into public.jornadas_trabalho (
        cidade, iniciada_em, expira_em, encerrada_em, origem
      ) values (
        'Base histórica importada', now(), now(), now(), 'legado'
      ) returning id into jornada_legado;
    end if;

    select id into varredura_legado
      from public.varreduras
      where jornada_id = jornada_legado
      order by iniciada_em asc
      limit 1;

    if varredura_legado is null then
      insert into public.varreduras (
        jornada_id, cidade, nichos, max_por_nicho, estado,
        encontrados, salvos, concluida_em
      ) values (
        jornada_legado, 'Base histórica importada', '["histórico"]'::jsonb,
        0, 'concluida', 0, 0, now()
      ) returning id into varredura_legado;
    end if;

    insert into public.varredura_leads (
      varredura_id, lead_id, score_na_varredura, motivo_na_varredura,
      cidade_na_varredura, status_na_entrada
    )
    select
      varredura_legado, l.id, l.score_oportunidade, l.motivo_abordagem,
      coalesce(l.cidade, 'Não informado'), l.status
    from public.leads l
    on conflict (varredura_id, lead_id) do nothing;

    update public.varreduras
      set encontrados = (select count(*) from public.varredura_leads where varredura_id = varredura_legado),
          salvos = (select count(*) from public.varredura_leads where varredura_id = varredura_legado)
      where id = varredura_legado;
  end if;
end;
$$;

alter table public.jornadas_trabalho enable row level security;
alter table public.varreduras enable row level security;
alter table public.varredura_leads enable row level security;
revoke all on table public.jornadas_trabalho, public.varreduras, public.varredura_leads from anon, authenticated;

commit;
