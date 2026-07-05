import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

/**
 * Liberação manual de plano pra quem comprou (beta, enquanto não há
 * webhook do Stripe). Uso:
 *   POST /api/admin/liberar
 *   header: x-admin-token: <ADMIN_TOKEN do .env>
 *   body: { "email": "cliente@x.com", "plano": "pro", "limite": 100 }
 * O usuário precisa já ter criado a conta no /login.
 */
export async function POST(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.headers.get("x-admin-token") !== token) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  let body: { email?: string; plano?: string; limite?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body.email) {
    return NextResponse.json({ error: "email obrigatório" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Localiza o usuário pelo e-mail via API admin (service key).
  const { data: lista, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }
  const alvo = lista.users.find(
    (u) => u.email?.toLowerCase() === body.email!.toLowerCase()
  );
  if (!alvo) {
    return NextResponse.json(
      { error: `nenhuma conta com o e-mail ${body.email} — peça pro cliente criar a conta primeiro` },
      { status: 404 }
    );
  }

  const { error } = await supabase.from("perfis").upsert(
    {
      user_id: alvo.id,
      email: alvo.email,
      plano: body.plano ?? "pro",
      varreduras_limite: body.limite ?? 100,
    },
    { onConflict: "user_id" }
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    liberado: {
      email: alvo.email,
      plano: body.plano ?? "pro",
      limite: body.limite ?? 100,
    },
  });
}
