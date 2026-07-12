import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/supabase";

export type JornadaTrabalho = {
  id: string;
  operador_id: string | null;
  cidade: string;
  iniciada_em: string;
  expira_em: string;
  encerrada_em: string | null;
  origem: "operacao" | "legado";
};

export function jornadaExpirada(expiraEm: string, agora = new Date()): boolean {
  return new Date(expiraEm).getTime() <= agora.getTime();
}

type NovaVarredura = {
  id: string;
  jornada_id: string;
};

function escopoOperador<T>(query: T, operadorId: string | null): T {
  const q = query as T & {
    eq: (column: string, value: string) => T;
    is: (column: string, value: null) => T;
  };
  return operadorId ? q.eq("operador_id", operadorId) : q.is("operador_id", null);
}

export async function obterJornadaAtiva(
  supabase: SupabaseClient,
  operadorId: string | null
): Promise<JornadaTrabalho | null> {
  const agora = new Date().toISOString();
  let query = supabase
    .from("jornadas_trabalho")
    .select("*")
    .is("encerrada_em", null)
    .gt("expira_em", agora)
    .order("iniciada_em", { ascending: false })
    .limit(1);
  query = escopoOperador(query, operadorId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data as JornadaTrabalho | null) ?? null;
}

export async function obterOuCriarJornadaAtiva(
  supabase: SupabaseClient,
  cidade: string,
  operadorId: string | null
): Promise<JornadaTrabalho> {
  const existente = await obterJornadaAtiva(supabase, operadorId);
  if (existente) return existente;

  // Fecha jornadas vencidas para manter o histórico consistente. A aplicação
  // atual é de operador único; Sprint 4 pode trocar este fluxo por RPC atômica
  // quando houver múltiplos usuários concorrentes.
  let fechar = supabase
    .from("jornadas_trabalho")
    .update({ encerrada_em: new Date().toISOString() })
    .is("encerrada_em", null)
    .lte("expira_em", new Date().toISOString());
  fechar = escopoOperador(fechar, operadorId);
  const { error: fecharErro } = await fechar;
  if (fecharErro) throw fecharErro;

  const { data, error } = await supabase
    .from("jornadas_trabalho")
    .insert({ cidade, operador_id: operadorId })
    .select("*")
    .single();
  if (error) throw error;
  return data as JornadaTrabalho;
}

export async function criarVarredura(
  supabase: SupabaseClient,
  jornadaId: string,
  cidade: string,
  nichos: string[],
  maxPorNicho: number
): Promise<NovaVarredura> {
  const { data, error } = await supabase
    .from("varreduras")
    .insert({ jornada_id: jornadaId, cidade, nichos, max_por_nicho: maxPorNicho })
    .select("id, jornada_id")
    .single();
  if (error) throw error;
  return data as NovaVarredura;
}

export async function concluirVarredura(
  supabase: SupabaseClient,
  varreduraId: string,
  resumo: { encontrados: number; salvos: number; ignorados: number },
  erros: string[]
) {
  const { error } = await supabase
    .from("varreduras")
    .update({
      estado: erros.length ? "falhou" : "concluida",
      ...resumo,
      erros: erros.slice(0, 20),
      concluida_em: new Date().toISOString(),
    })
    .eq("id", varreduraId);
  if (error) throw error;
}

export async function vincularLeadAVarredura(
  supabase: SupabaseClient,
  input: {
    varreduraId: string;
    lead: Pick<Lead, "id" | "score_oportunidade" | "motivo_abordagem" | "cidade" | "status">;
  }
) {
  const { lead, varreduraId } = input;
  const { error } = await supabase.from("varredura_leads").upsert(
    {
      varredura_id: varreduraId,
      lead_id: lead.id,
      score_na_varredura: lead.score_oportunidade,
      motivo_na_varredura: lead.motivo_abordagem,
      cidade_na_varredura: lead.cidade ?? "Não informado",
      status_na_entrada: lead.status,
    },
    { onConflict: "varredura_id,lead_id", ignoreDuplicates: false }
  );
  if (error) throw error;
}

export async function listarLeadsDaJornada(
  supabase: SupabaseClient,
  jornadaId: string
): Promise<Lead[]> {
  const { data: runs, error: runsError } = await supabase
    .from("varreduras")
    .select("id")
    .eq("jornada_id", jornadaId);
  if (runsError) throw runsError;
  const runIds = (runs ?? []).map((run) => run.id as string);
  if (runIds.length === 0) return [];

  const { data: refs, error: refsError } = await supabase
    .from("varredura_leads")
    .select("lead_id")
    .in("varredura_id", runIds);
  if (refsError) throw refsError;
  const leadIds = Array.from(new Set((refs ?? []).map((ref) => ref.lead_id as string)));
  if (leadIds.length === 0) return [];

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .in("id", leadIds)
    .order("score_oportunidade", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lead[];
}
