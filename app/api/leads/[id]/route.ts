import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  supabaseConfigurado,
} from "@/lib/supabase";
import type { LeadStatus } from "@/lib/supabase";
import { authConfigurado, getUsuario } from "@/lib/auth";

const STATUS_VALIDOS: LeadStatus[] = [
  "não contatado",
  "contatado",
  "respondeu",
  "fechado",
  "sem interesse",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.status || !STATUS_VALIDOS.includes(body.status as LeadStatus)) {
    return NextResponse.json(
      { error: `status precisa ser um de: ${STATUS_VALIDOS.join(", ")}` },
      { status: 400 }
    );
  }

  // Modo demo: o estado vive só no navegador, então só confirmamos.
  if (!supabaseConfigurado()) {
    return NextResponse.json({ lead: { id: params.id, status: body.status } });
  }

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("leads")
    .update({ status: body.status })
    .eq("id", params.id);

  // Modo multiusuário: só o dono do lead pode alterar o status dele.
  if (authConfigurado()) {
    const usuario = await getUsuario();
    if (!usuario) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    query = query.eq("user_id", usuario.id);
  }

  const { data, error } = await query.select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead: data });
}
