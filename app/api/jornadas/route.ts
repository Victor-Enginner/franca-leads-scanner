import { NextRequest, NextResponse } from "next/server";
import { authConfigurado, getUsuario } from "@/lib/auth";
import { getSupabaseServerClient, supabaseConfigurado } from "@/lib/supabase";

// Histórico compacto para o seletor do dashboard. Leads de uma jornada são
// buscados sob demanda via /api/leads?jornada=<id>.
export async function GET(req: NextRequest) {
  if (!supabaseConfigurado()) {
    return NextResponse.json({ jornadas: [] });
  }

  const limite = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limite") ?? 20), 1), 50);
  let operadorId: string | null = null;
  if (authConfigurado()) {
    const usuario = await getUsuario();
    if (!usuario) return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    operadorId = usuario.id;
  }

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("jornadas_trabalho")
    .select("id, cidade, iniciada_em, expira_em, encerrada_em, origem, varreduras(id, encontrados, salvos, ignorados, estado)")
    .order("iniciada_em", { ascending: false })
    .limit(limite);
  query = operadorId ? query.eq("operador_id", operadorId) : query.is("operador_id", null);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jornadas: data ?? [] });
}
