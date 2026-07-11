-- Sprint 1 — preservar a data real de contato, separada de novas varreduras.

begin;

alter table public.leads add column if not exists ultimo_contato_em timestamptz;

-- Backfill único: é uma aproximação para leads históricos. Depois disso,
-- novas varreduras não alteram esta data; apenas mudanças para contatado ou
-- respondeu feitas pelo operador atualizam o campo.
update public.leads
  set ultimo_contato_em = atualizado_em
  where ultimo_contato_em is null
    and status in ('contatado', 'respondeu');

create index if not exists leads_ultimo_contato_idx
  on public.leads (ultimo_contato_em);

commit;
