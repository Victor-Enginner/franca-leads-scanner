-- Sprint 0 — bloquear acesso direto à base em produção.
--
-- As API routes do NEXUS usam SUPABASE_SERVICE_ROLE_KEY no servidor e
-- continuam funcionando: a service_role ignora RLS. anon e authenticated
-- ficam sem acesso direto até a Sprint 4 criar policies por operador.
-- Rode este arquivo UMA vez no SQL Editor do Supabase de produção.

begin;

alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;

do $$
begin
  if to_regclass('public.perfis') is not null then
    execute 'alter table public.perfis enable row level security';
    execute 'revoke all on table public.perfis from anon, authenticated';
  end if;
end;
$$;

commit;
