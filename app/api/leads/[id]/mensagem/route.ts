import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  supabaseConfigurado,
} from "@/lib/supabase";
import type { Lead } from "@/lib/supabase";
import { SEED_LEADS } from "@/lib/seed-data";
import { authConfigurado, getUsuario } from "@/lib/auth";
import { iaConfigurada, gerarMensagemIA } from "@/lib/ia";
import { checarSite } from "@/lib/enrich";

export const maxDuration = 30;

// POST /api/leads/[id]/mensagem → gera nova mensagem de abordagem via IA.
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!iaConfigurada()) {
    return NextResponse.json(
      {
        error:
          "Geração por IA não configurada — defina GROQ_API_KEY no ambiente.",
      },
      { status: 400 }
    );
  }

  // Localiza o lead (banco real ou seeds no modo demo).
  let lead: Lead | undefined;
  if (!supabaseConfigurado()) {
    lead = SEED_LEADS.find((l) => l.id === params.id);
  } else {
    const supabase = getSupabaseServerClient();
    let query = supabase.from("leads").select("*").eq("id", params.id);
    if (authConfigurado()) {
      const usuario = await getUsuario();
      if (!usuario) {
        return NextResponse.json({ error: "não autenticado" }, { status: 401 });
      }
      query = query.eq("user_id", usuario.id);
    }
    const { data } = await query.single();
    lead = data ?? undefined;
  }

  if (!lead) {
    return NextResponse.json({ error: "lead não encontrado" }, { status: 404 });
  }

  try {
    // Enriquecimento: checa o site antes de gerar (gancho pra mensagem).
    const site = await checarSite(lead.site);
    const mensagem = await gerarMensagemIA(lead, site);

    // Persiste no banco (modo demo só devolve pro cliente).
    if (supabaseConfigurado()) {
      const supabase = getSupabaseServerClient();
      await supabase
        .from("leads")
        .update({ mensagem_sugerida: mensagem })
        .eq("id", lead.id);
    }

    return NextResponse.json({ mensagem, site });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
