import { redirect } from "next/navigation";
import { getSupabaseServerClient, supabaseConfigurado } from "@/lib/supabase";
import type { Lead } from "@/lib/supabase";
import { SEED_LEADS } from "@/lib/seed-data";
import { authConfigurado, getUsuario } from "@/lib/auth";
import { iaConfigurada } from "@/lib/ia";
import { listarLeadsDaJornada, obterJornadaAtiva } from "@/lib/jornadas";
import ScannerDashboard from "@/components/scanner/ScannerDashboard";

export const dynamic = "force-dynamic";

async function getLeadsIniciais(
  userId: string | null
): Promise<{ leads: Lead[]; demo: boolean; erroInicial: string | null }> {
  // Sem Supabase configurado → modo demo com os leads reais de Franca.
  if (!supabaseConfigurado()) {
    return { leads: SEED_LEADS, demo: true, erroInicial: null };
  }

  try {
    const supabase = getSupabaseServerClient();
    const jornada = await obterJornadaAtiva(supabase, userId);
    // Abrir o NEXUS após a expiração da jornada inicia um ambiente limpo.
    // A jornada só é criada quando uma nova varredura é iniciada.
    if (!jornada) return { leads: [], demo: false, erroInicial: null };
    return {
      leads: await listarLeadsDaJornada(supabase, jornada.id),
      demo: false,
      erroInicial: null,
    };
  } catch (err) {
    // Banco configurado que falha não pode parecer uma base demo válida.
    console.error("Falha ao consultar o Supabase:", err);
    return {
      leads: [],
      demo: false,
      erroInicial: "BANCO INDISPONÍVEL — NÃO INICIE VARREDURAS ATÉ NORMALIZAR",
    };
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

  const { leads, demo, erroInicial } = await getLeadsIniciais(usuarioId);
  return (
    <ScannerDashboard
      leadsIniciais={leads}
      demo={demo}
      usuarioEmail={usuarioEmail}
      iaAtiva={iaConfigurada()}
      erroInicial={erroInicial}
    />
  );
}
