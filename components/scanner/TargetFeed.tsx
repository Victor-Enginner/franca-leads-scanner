"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lead } from "@/lib/supabase";
import TargetCard from "./TargetCard";

export type FeedFilter = "all" | "hot" | "queue";

const FILTROS: { key: FeedFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "hot", label: "Alta prior." },
  { key: "queue", label: "Na fila" },
];

const LOTE = 30;

export default function TargetFeed({
  leads,
  filter,
  onFilterChange,
  progress,
  onCopy,
  onWhatsApp,
  onToggleDone,
  onGerarIA,
  iaAtiva = false,
}: {
  leads: Lead[];
  filter: FeedFilter;
  onFilterChange: (f: FeedFilter) => void;
  progress: number;
  onCopy: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
  onToggleDone: (lead: Lead) => void;
  onGerarIA?: (lead: Lead) => Promise<void>;
  iaAtiva?: boolean;
}) {
  const [busca, setBusca] = useState("");
  const [nichoSel, setNichoSel] = useState("todos");
  const [cidadeSel, setCidadeSel] = useState("todas");
  const [mostrar, setMostrar] = useState(LOTE);

  const nichos = useMemo(
    () => Array.from(new Set(leads.map((l) => l.nicho))).sort(),
    [leads]
  );
  const cidades = useMemo(
    () =>
      Array.from(
        new Set(leads.map((l) => l.cidade).filter((c): c is string => !!c))
      ).sort(),
    [leads]
  );

  const visiveis = leads.filter((l) => {
    if (filter === "hot" && l.score_oportunidade < 50) return false;
    if (filter === "queue" && l.status !== "não contatado") return false;
    if (nichoSel !== "todos" && l.nicho !== nichoSel) return false;
    if (cidadeSel !== "todas" && l.cidade !== cidadeSel) return false;
    if (busca && !l.nome.toLowerCase().includes(busca.toLowerCase()))
      return false;
    return true;
  });

  // Mudou qualquer filtro → volta pro primeiro lote.
  useEffect(() => {
    setMostrar(LOTE);
  }, [filter, busca, nichoSel, cidadeSel]);

  const pagina = visiveis.slice(0, mostrar);
  const restantes = visiveis.length - pagina.length;

  const selectCls =
    "flex-1 min-w-0 rounded-sm border border-grid bg-void-2 px-1.5 py-1.5 font-mono text-[9px] uppercase tracking-wide text-text-dim outline-none transition-colors hover:border-cyan-dim focus:border-cyan";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-grid px-5 pb-2.5 pt-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[3px] text-cyan-dim">
          <span className="text-cyan">▸</span> Feed de alvos
          <span className="ml-auto font-mono text-[9px] tracking-wide text-text-dim">
            {visiveis.length}/{leads.length}
          </span>
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
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="⌕ buscar alvo por nome..."
          className="mt-1.5 w-full rounded-sm border border-grid bg-void-2 px-2.5 py-1.5 font-body text-xs text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-cyan"
        />
        <div className="mt-1.5 flex gap-1.5">
          <select
            value={nichoSel}
            onChange={(e) => setNichoSel(e.target.value)}
            className={selectCls}
          >
            <option value="todos">nicho: todos</option>
            {nichos.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select
            value={cidadeSel}
            onChange={(e) => setCidadeSel(e.target.value)}
            className={selectCls}
          >
            <option value="todas">setor: todos</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
              <div>
                //{" "}
                {leads.length === 0
                  ? "0 alvos · aguardando comando"
                  : "nenhum alvo bate com os filtros"}
              </div>
            </div>
          </div>
        ) : (
          <>
            {pagina.map((lead) => (
              <TargetCard
                key={lead.id}
                lead={lead}
                onCopy={onCopy}
                onWhatsApp={onWhatsApp}
                onToggleDone={onToggleDone}
                onGerarIA={onGerarIA}
                iaAtiva={iaAtiva}
              />
            ))}
            {restantes > 0 && (
              <button
                onClick={() => setMostrar((m) => m + LOTE)}
                className="mt-1 rounded-sm border border-cyan-dim bg-void-2 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[2px] text-cyan transition-colors hover:bg-cyan/10"
              >
                ▼ carregar mais {Math.min(LOTE, restantes)} ({restantes}{" "}
                restantes)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
