import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  supabaseConfigurado,
} from "@/lib/supabase";
import { SEED_LEADS } from "@/lib/seed-data";
import { authConfigurado, getUsuario } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nicho = searchParams.get("nicho");
  const status = searchParams.get("status");
  const minScore = searchParams.get("minScore");
  const cidade = searchParams.get("cidade");

  // Modo demo: filtra os seeds em memória.
  if (!supabaseConfigurado()) {
    let leads = [...SEED_LEADS];
    if (nicho) leads = leads.filter((l) => l.nicho === nicho);
    if (status) leads = leads.filter((l) => l.status === status);
    if (cidade) leads = leads.filter((l) => l.cidade === cidade);
    if (minScore)
      leads = leads.filter((l) => l.score_oportunidade >= Number(minScore));
    return NextResponse.json({ leads });
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

  if (nicho) query = query.eq("nicho", nicho);
  if (status) query = query.eq("status", status);
  if (cidade) query = query.eq("cidade", cidade);
  if (minScore) query = query.gte("score_oportunidade", Number(minScore));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}
