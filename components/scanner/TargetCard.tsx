"use client";

import { useState } from "react";
import type { Lead } from "@/lib/supabase";
import { scoreClass, waHref } from "./util";

const BORDA: Record<string, string> = {
  high: "border-l-amber",
  mid: "border-l-cyan",
  low: "border-l-text-dim",
};

const SCORE_COR: Record<string, string> = {
  high: "text-amber [text-shadow:0_0_8px_rgba(255,184,0,0.5)]",
  mid: "text-cyan [text-shadow:0_0_8px_rgba(0,240,255,0.5)]",
  low: "text-text-dim",
};

const TAG_COR: Record<string, string> = {
  sem_site: "bg-amber/10 text-amber",
  so_rede_social: "bg-cyan/10 text-cyan",
  poucas_reviews: "bg-lime/10 text-lime",
  geral: "bg-text-dim/15 text-text-dim",
};

export default function TargetCard({
  lead,
  onCopy,
  onWhatsApp,
  onToggleDone,
  onGerarIA,
  iaAtiva = false,
}: {
  lead: Lead;
  onCopy: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
  onToggleDone: (lead: Lead) => void;
  onGerarIA?: (lead: Lead) => Promise<void>;
  iaAtiva?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [gerando, setGerando] = useState(false);
  const cls = scoreClass(lead.score_oportunidade);
  const done = lead.status === "fechado";
  const wa = waHref(lead);

  async function gerarIA(e: React.MouseEvent) {
    e.stopPropagation();
    if (!onGerarIA || gerando) return;
    setGerando(true);
    try {
      await onGerarIA(lead);
    } finally {
      setGerando(false);
    }
  }

  return (
    <div
      className="animate-target-in opacity-0"
      style={{ transform: "translateX(20px)" }}
    >
    <div
      className={`relative cursor-pointer rounded-sm border border-grid border-l-2 bg-void-2 p-3 transition-all hover:bg-[#0a1826] ${BORDA[cls]} ${done ? "opacity-50" : ""}`}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`font-body text-sm font-semibold leading-tight text-text-primary ${done ? "line-through" : ""}`}
        >
          {lead.nome}
        </div>
        <div
          className={`min-w-[34px] py-0.5 text-center font-display text-base font-bold ${SCORE_COR[cls]}`}
        >
          {lead.score_oportunidade}
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 font-mono text-[9px] tracking-wide text-text-dim">
        <span>★ {lead.rating ?? "-"}</span>
        <span>{lead.qtd_reviews ?? 0} rev</span>
        <span>{lead.nicho}</span>
        {lead.cidade && <span className="text-cyan-dim">◈ {lead.cidade}</span>}
      </div>
      <span
        className={`mt-2 inline-block rounded-[1px] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${TAG_COR[lead.motivo_abordagem] ?? TAG_COR.geral}`}
      >
        {lead.motivo_abordagem.replace(/_/g, " ")}
      </span>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${open ? "max-h-[360px]" : "max-h-0"}`}
      >
        <div className="relative mt-3 max-h-[130px] overflow-y-auto rounded-sm border border-grid bg-void p-2.5 font-body text-xs leading-normal text-text-dim">
          {gerando ? (
            <span className="animate-blink-slow font-mono text-[10px] tracking-wide text-magenta">
              ✦ gerando abordagem personalizada com IA...
            </span>
          ) : (
            lead.mensagem_sugerida
          )}
        </div>
        {iaAtiva && (
          <button
            onClick={gerarIA}
            disabled={gerando}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-sm border border-magenta/60 bg-magenta/5 px-2 py-2 font-mono text-[9px] uppercase tracking-wide text-magenta transition-colors hover:bg-magenta/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {gerando ? "processando..." : "✦ gerar mensagem com IA"}
          </button>
        )}
        <div className="mt-2.5 flex gap-1.5">
          <button
            className="flex flex-1 items-center justify-center gap-1 rounded-sm border border-cyan-dim bg-transparent px-2 py-2 font-mono text-[9px] uppercase tracking-wide text-cyan transition-colors hover:bg-cyan/15"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(lead);
            }}
          >
            ⧉ copiar
          </button>
          {wa ? (
            <a
              className="flex flex-1 items-center justify-center gap-1 rounded-sm border border-lime bg-lime/10 px-2 py-2 font-mono text-[9px] uppercase tracking-wide text-lime transition-colors hover:bg-lime/20"
              href={wa}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                onWhatsApp(lead);
              }}
            >
              ◈ whatsapp
            </a>
          ) : (
            <div className="flex flex-1 cursor-not-allowed items-center justify-center rounded-sm border border-lime/40 px-2 py-2 font-mono text-[9px] uppercase tracking-wide text-lime/40">
              sem tel
            </div>
          )}
          <button
            className={`flex flex-1 items-center justify-center gap-1 rounded-sm border px-2 py-2 font-mono text-[9px] uppercase tracking-wide transition-colors ${
              done
                ? "border-lime bg-lime/10 text-lime"
                : "border-grid text-text-dim hover:border-text-primary hover:text-text-primary"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleDone(lead);
            }}
          >
            ✓ feito
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
