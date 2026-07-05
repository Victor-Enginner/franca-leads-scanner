import { createClient } from "@supabase/supabase-js";

// True quando as duas variáveis do Supabase estão preenchidas no .env.
// Quando false, a app roda em "modo demo" com os leads de seed-data.ts,
// sem exigir banco. Isso deixa você ver tudo funcionando antes de
// configurar credenciais.
export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Este client só deve ser importado em código server-side (API routes,
// server components). Usa a service_role key — nunca importe este
// arquivo em um "use client".
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos no .env"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      // O Next.js patcheia o fetch global e pode guardar respostas no
      // Data Cache mesmo em páginas dinâmicas — aí o dashboard mostraria
      // uma lista velha (ou vazia) de leads. Dados de banco nunca devem
      // ser cacheados aqui.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export type LeadStatus =
  | "não contatado"
  | "contatado"
  | "respondeu"
  | "fechado"
  | "sem interesse";

export type Lead = {
  id: string;
  nicho: string;
  nome: string;
  endereco: string | null;
  telefone: string | null;
  site: string | null;
  rating: number | null;
  qtd_reviews: number | null;
  score_oportunidade: number;
  motivo_abordagem: string;
  mensagem_sugerida: string;
  status: LeadStatus;
  place_id: string;
  lat: number | null;
  lon: number | null;
  cidade: string | null;
  criado_em: string;
  atualizado_em: string;
};
