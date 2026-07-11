"use client";

import type { Lead } from "@/lib/supabase";

// Funil ativo: quem perdeu interesse ou já fechou não volta para a fila.
export default function FunnelTracker({ leads }: { leads: Lead[] }) {
  let fila = 0;
  let contatado = 0;
  let respondeu = 0;
  for (const l of leads) {
    if (l.status === "contatado") contatado++;
    else if (l.status === "respondeu") respondeu++;
    else if (l.status === "não contatado") fila++;
  }

  const celula =
    "flex-1 rounded-sm border border-grid bg-void-2 px-1 py-2 text-center";
  const num = "font-display text-base font-bold";
  const rotulo =
    "font-mono text-[7px] uppercase tracking-wider text-text-dim";

  return (
    <div className="flex gap-1.5">
      <div className={celula}>
        <div className={`${num} text-text-dim`}>{fila}</div>
        <div className={rotulo}>Fila</div>
      </div>
      <div className={celula}>
        <div className={`${num} text-cyan`}>{contatado}</div>
        <div className={rotulo}>Contatado</div>
      </div>
      <div className={celula}>
        <div className={`${num} text-lime`}>{respondeu}</div>
        <div className={rotulo}>Respondeu</div>
      </div>
    </div>
  );
}
