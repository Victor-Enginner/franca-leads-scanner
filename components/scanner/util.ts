import type { Lead } from "@/lib/supabase";

// Coordenadas de Franca/SP — centro do setor de varredura.
export const FRANCA = { lat: -20.5386, lon: -47.4008 };

export type ScoreClass = "high" | "mid" | "low";

export function scoreClass(score: number): ScoreClass {
  return score >= 50 ? "high" : score >= 25 ? "mid" : "low";
}

// Cor do ponto no globo por prioridade (amber / cyan / cinza).
export function scoreColor(score: number): number {
  return score >= 50 ? 0xffb800 : score >= 25 ? 0x00f0ff : 0x4a6f7d;
}

// Link wa.me com a mensagem preenchida. O envio é sempre manual —
// isso só abre a conversa (regra do AGENTS.md).
export function waHref(lead: Lead): string | null {
  if (!lead.telefone) return null;
  const digits = lead.telefone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(lead.mensagem_sugerida)}`;
}

// Fallback de persistência no modo demo (sem Supabase).
export const DEMO_STORE_KEY = "nexus_scan_franca_status_v1";
