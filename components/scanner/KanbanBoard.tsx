"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/supabase";
import { scoreClass, waHref } from "./util";

const COLUNAS: { status: LeadStatus; label: string; cor: string }[] = [
  { status: "não contatado", label: "Fila", cor: "text-text-dim" },
  { status: "contatado", label: "Contatado", cor: "text-cyan" },
  { status: "respondeu", label: "Respondeu", cor: "text-lime" },
  { status: "fechado", label: "Fechado", cor: "text-amber" },
  { status: "sem interesse", label: "Sem interesse", cor: "text-danger" },
];

const BORDA: Record<string, string> = {
  high: "border-l-amber",
  mid: "border-l-cyan",
  low: "border-l-text-dim",
};

function diasDesde(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.floor(ms / 86_400_000);
}

export default function KanbanBoard({
  leads,
  onStatusChange,
  onNotasChange,
  onCopy,
}: {
  leads: Lead[];
  onStatusChange: (lead: Lead, status: LeadStatus) => void;
  onNotasChange: (lead: Lead, notas: string) => void;
  onCopy: (lead: Lead) => void;
}) {
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<LeadStatus | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState("");

  function soltar(status: LeadStatus) {
    const lead = leads.find((l) => l.id === arrastando);
    if (lead && lead.status !== status) onStatusChange(lead, status);
    setArrastando(null);
    setSobre(null);
  }

  return (
    <div className="flex h-full gap-3 overflow-x-auto p-4">
      {COLUNAS.map((col) => {
        const doStatus = leads.filter((l) => l.status === col.status);
        return (
          <div
            key={col.status}
            onDragOver={(e) => {
              e.preventDefault();
              setSobre(col.status);
            }}
            onDragLeave={() => setSobre((s) => (s === col.status ? null : s))}
            onDrop={() => soltar(col.status)}
            className={`flex w-[280px] shrink-0 flex-col rounded-sm border bg-panel/40 transition-colors ${
              sobre === col.status
                ? "border-cyan bg-cyan/5"
                : "border-grid"
            }`}
          >
            <div className="flex items-center justify-between border-b border-grid px-3 py-2.5">
              <span
                className={`font-mono text-[10px] uppercase tracking-[2px] ${col.cor}`}
              >
                {col.label}
              </span>
              <span className="font-display text-sm font-bold text-text-dim">
                {doStatus.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
              {doStatus.length === 0 && (
                <div className="grid flex-1 place-items-center py-8 font-mono text-[9px] tracking-wide text-text-dim">
                  // vazio
                </div>
              )}
              {doStatus.map((lead) => {
                const cls = scoreClass(lead.score_oportunidade);
                const dias = diasDesde(lead.ultimo_contato_em);
                const parado =
                  lead.status === "contatado" && dias !== null && dias >= 3;
                const wa = waHref(lead);
                const emEdicao = editando === lead.id;
                return (
                  <div
                    key={lead.id}
                    draggable={!emEdicao}
                    onDragStart={() => setArrastando(lead.id)}
                    onDragEnd={() => setArrastando(null)}
                    className={`cursor-grab rounded-sm border border-grid border-l-2 bg-void-2 p-2.5 transition-opacity active:cursor-grabbing ${BORDA[cls]} ${
                      arrastando === lead.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-body text-xs font-semibold leading-tight text-text-primary">
                        {lead.nome}
                      </span>
                      <span className="font-display text-xs font-bold text-text-dim">
                        {lead.score_oportunidade}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-2 font-mono text-[8px] tracking-wide text-text-dim">
                      <span>{lead.nicho}</span>
                      {lead.cidade && (
                        <span className="text-cyan-dim">◈ {lead.cidade}</span>
                      )}
                      {parado && (
                        <span className="text-amber">⚠ há {dias}d sem retorno</span>
                      )}
                    </div>

                    {emEdicao ? (
                      <div className="mt-2">
                        <textarea
                          autoFocus
                          value={rascunho}
                          onChange={(e) => setRascunho(e.target.value)}
                          placeholder="anotação sobre este lead..."
                          className="min-h-[54px] w-full resize-y rounded-sm border border-cyan bg-void p-1.5 font-body text-[11px] text-text-primary outline-none"
                        />
                        <div className="mt-1 flex gap-1">
                          <button
                            onClick={() => {
                              onNotasChange(lead, rascunho.trim());
                              setEditando(null);
                            }}
                            className="flex-1 rounded-sm border border-lime bg-lime/10 py-1 font-mono text-[8px] uppercase tracking-wide text-lime"
                          >
                            salvar
                          </button>
                          <button
                            onClick={() => setEditando(null)}
                            className="flex-1 rounded-sm border border-grid py-1 font-mono text-[8px] uppercase tracking-wide text-text-dim"
                          >
                            cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {lead.notas && (
                          <p className="mt-1.5 rounded-sm bg-void/60 p-1.5 font-body text-[11px] italic leading-snug text-text-dim">
                            {lead.notas}
                          </p>
                        )}
                        <div className="mt-2 flex gap-1">
                          <button
                            onClick={() => {
                              setEditando(lead.id);
                              setRascunho(lead.notas ?? "");
                            }}
                            className="flex-1 rounded-sm border border-grid py-1 font-mono text-[8px] uppercase tracking-wide text-text-dim transition-colors hover:border-cyan-dim hover:text-cyan"
                          >
                            ✎ nota
                          </button>
                          <button
                            onClick={() => onCopy(lead)}
                            className="flex-1 rounded-sm border border-cyan-dim py-1 font-mono text-[8px] uppercase tracking-wide text-cyan transition-colors hover:bg-cyan/15"
                          >
                            ⧉ msg
                          </button>
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                if (lead.status === "não contatado")
                                  onStatusChange(lead, "contatado");
                              }}
                              className="flex-1 rounded-sm border border-lime py-1 text-center font-mono text-[8px] uppercase tracking-wide text-lime transition-colors hover:bg-lime/15"
                            >
                              ◈ wa
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
