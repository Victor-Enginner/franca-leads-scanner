import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  supabaseConfigurado,
} from "@/lib/supabase";
import { SEED_LEADS } from "@/lib/seed-data";
import { authConfigurado, getUsuario } from "@/lib/auth";
import { listarLeadsDaJornada, obterJornadaAtiva } from "@/lib/jornadas";
import type { Lead } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nicho = searchParams.get("nicho");
  const status = searchParams.get("status");
  const minScore = searchParams.get("minScore");
  const cidade = searchParams.get("cidade");
  const jornadaId = searchParams.get("jornada");
  const historico = searchParams.get("historico") === "all";

  const filtrar = (leads: Lead[]) => leads.filter((lead) => {
    if (nicho && lead.nicho !== nicho) return false;
    if (status && lead.status !== status) return false;
    if (cidade && lead.cidade !== cidade) return false;
    if (minScore && lead.score_oportunidade < Number(minScore)) return false;
    return true;
  });

  // Modo demo: filtra os seeds em memória.
  if (!supabaseConfigurado()) {
    let leads = [...SEED_LEADS];
    if (nicho) leads = leads.filter((l) => l.nicho === nicho);
    if (status) leads = leads.filter((l) => l.status === status);
    if (cidade) leads = leads.filter((l) => l.cidade === cidade);
    if (minScore)
      leads = leads.filter((l) => l.score_oportunidade >= Number(minScore));
    return NextResponse.json({ leads: filtrar(leads), jornada: null });
  }

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("leads")
    .select("*")
    .order("score_oportunidade", { ascending: false });

  // Modo multiusuário: cada operador só enxerga os próprios leads.
  if (authConfigurado()) {
    const usuario = await getUsuario();
    if (!usuario) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    query = query.eq("user_id", usuario.id);
  }

  // O feed operacional usa somente a jornada atual. A base inteira só é
  // consultada explicitamente para histórico/administração.
  if (!historico) {
    let alvoJornada = jornadaId;
    if (!alvoJornada) {
      const atual = await obterJornadaAtiva(supabase, authConfigurado() ? (await getUsuario())?.id ?? null : null);
      alvoJornada = atual?.id ?? null;
    }
    if (!alvoJornada) return NextResponse.json({ leads: [], jornada: null });
    const leads = filtrar(await listarLeadsDaJornada(supabase, alvoJornada));
    return NextResponse.json({ leads, jornada: alvoJornada });
  }

  if (nicho) query = query.eq("nicho", nicho);
  if (status) query = query.eq("status", status);
  if (cidade) query = query.eq("cidade", cidade);
  if (minScore) query = query.gte("score_oportunidade", Number(minScore));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data, jornada: null });
}
