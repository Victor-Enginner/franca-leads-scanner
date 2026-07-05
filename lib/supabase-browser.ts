"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client de NAVEGADOR: usa somente a chave publishable/anon (pública por
// design). A service key continua exclusiva do servidor (regra do
// AGENTS.md). Sessão fica em cookie, visível pro servidor.
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function authAtivoNoCliente(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
