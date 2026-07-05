import { redirect } from "next/navigation";
import { getSupabaseServerClient, supabaseConfigurado } from "@/lib/supabase";
import type { Lead } from "@/lib/supabase";
import { SEED_LEADS } from "@/lib/seed-data";
import { authConfigurado, getUsuario } from "@/lib/auth";
import ScannerDashboard from "@/components/scanner/ScannerDashboard";

export const dynamic = "force-dynamic";

async function getLeadsIniciais(
  userId: string | null
): Promise<{ leads: Lead[]; demo: boolean }> {
  // Sem Supabase configurado → modo demo com os leads reais de Franca.
  if (!supabaseConfigurado()) {
    return { leads: SEED_LEADS, demo: true };
  }

  try {
    const supabase = getSupabaseServerClient();
    let query = supabase
      .from("leads")
      .select("*")
      .order("score_oportunidade", { ascending: false });
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query;

    if (error) throw error;

    // Banco configurado mas ainda vazio → feed começa vazio; a primeira
    // varredura real popula. (Não é modo demo: o .env está pronto.)
    return { leads: data ?? [], demo: false };
  } catch (err) {
    // Credenciais presentes mas a consulta falhou (key errada, tabela
    // ausente...) → loga no servidor e cai no demo pra app não quebrar.
    console.error("Falha ao consultar o Supabase, caindo no modo demo:", err);
    return { leads: SEED_LEADS, demo: true };
  }
}

export default async function Home() {
  // Multiusuário ativo → exige sessão; sem sessão vai pro /login.
  let usuarioEmail: string | null = null;
  let usuarioId: string | null = null;
  if (supabaseConfigurado() && authConfigurado()) {
    const usuario = await getUsuario();
    if (!usuario) redirect("/login");
    usuarioEmail = usuario.email ?? null;
    usuarioId = usuario.id;
  }

  const { leads, demo } = await getLeadsIniciais(usuarioId);
  return (
    <ScannerDashboard
      leadsIniciais={leads}
      demo={demo}
      usuarioEmail={usuarioEmail}
    />
  );
}
