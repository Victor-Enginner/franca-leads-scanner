"use client";

import type { Lead } from "@/lib/supabase";
import TargetCard from "./TargetCard";

export type FeedFilter = "all" | "hot" | "queue";

const FILTROS: { key: FeedFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "hot", label: "Alta prior." },
  { key: "queue", label: "Na fila" },
];

export default function TargetFeed({
  leads,
  filter,
  onFilterChange,
  progress,
  onCopy,
  onWhatsApp,
  onToggleDone,
}: {
  leads: Lead[];
  filter: FeedFilter;
  onFilterChange: (f: FeedFilter) => void;
  progress: number;
  onCopy: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
  onToggleDone: (lead: Lead) => void;
}) {
  const visiveis = leads.filter((l) => {
    if (filter === "hot") return l.score_oportunidade >= 50;
    if (filter === "queue") return l.status === "não contatado";
    return true;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-grid px-5 pb-2.5 pt-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[3px] text-cyan-dim">
          <span className="text-cyan">▸</span> Feed de alvos
          <span className="h-px flex-1 bg-grid" />
        </div>
        <div className="mt-2.5 flex gap-1.5">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`flex-1 rounded-sm border px-1 py-1.5 font-mono text-[9px] uppercase tracking-wide transition-colors ${
                filter === f.key
                  ? "border-cyan bg-cyan/10 text-cyan"
                  : "border-grid bg-void-2 text-text-dim hover:border-cyan-dim hover:text-cyan"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-0.5 overflow-hidden bg-grid">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan to-magenta shadow-[0_0_10px_#00f0ff] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {visiveis.length === 0 ? (
          <div className="grid h-full place-items-center px-5 py-10 text-center font-mono text-[11px] leading-loose tracking-[2px] text-text-dim">
            <div>
              <div className="animate-blink-slow">// grid em espera</div>
              <div>// 0 alvos · aguardando comando</div>
            </div>
          </div>
        ) : (
          visiveis.map((lead) => (
            <TargetCard
              key={lead.id}
              lead={lead}
              onCopy={onCopy}
              onWhatsApp={onWhatsApp}
              onToggleDone={onToggleDone}
            />
          ))
        )}
      </div>
    </div>
  );
}
