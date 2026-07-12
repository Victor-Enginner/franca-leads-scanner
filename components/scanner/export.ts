import type { Lead } from "@/lib/supabase";

function csvCampo(v: unknown): string {
  const original = v == null ? "" : String(v);
  // Excel/Sheets interpretam =, +, - e @ como fórmula. Dados de empresas
  // são externos, portanto neutralizamos esse comportamento na exportação.
  const s = /^[=+\-@]/.test(original) ? `'${original}` : original;
  return `"${s.replace(/"/g, '""')}"`;
}

// Baixa a lista de leads como CSV (abre no Excel/Sheets).
export function baixarCSV(leads: Lead[], nomeArquivo = "nexus-leads.csv") {
  const cols = [
    "nome",
    "nicho",
    "cidade",
    "telefone",
    "site",
    "rating",
    "qtd_reviews",
    "score_oportunidade",
    "motivo_abordagem",
    "status",
    "notas",
    "mensagem_sugerida",
  ] as const;

  const linhas = [
    cols.join(","),
    ...leads.map((l) => cols.map((c) => csvCampo(l[c])).join(",")),
  ];
  // BOM p/ acento abrir certo no Excel.
  const blob = new Blob(["﻿" + linhas.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

// Abre um relatório imprimível com a marca NEXUS (o usuário salva como PDF
// pelo diálogo de impressão). Sem dependência de lib de PDF.
export function abrirRelatorio(leads: Lead[], setor: string) {
  const quentes = leads.filter((l) => l.score_oportunidade >= 50).length;
  const esc = (s: unknown) =>
    String(s ?? "").replace(/[&<>]/g, (c) =>
      c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"
    );

  const linhas = [...leads]
    .sort((a, b) => b.score_oportunidade - a.score_oportunidade)
    .map(
      (l) => `<tr>
        <td class="score ${l.score_oportunidade >= 50 ? "hot" : ""}">${l.score_oportunidade}</td>
        <td><strong>${esc(l.nome)}</strong><br><span class="dim">${esc(l.nicho)} · ${esc(l.cidade ?? "")}</span></td>
        <td>${esc(l.motivo_abordagem).replace(/_/g, " ")}</td>
        <td>${l.rating ?? "-"} ★ · ${l.qtd_reviews ?? 0} rev</td>
        <td>${esc(l.telefone ?? "—")}</td>
        <td class="status">${esc(l.status)}</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>NEXUS SCAN — Relatório ${esc(setor)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #0a141e; margin: 32px; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #00b3c4; padding-bottom: 12px; }
  h1 { margin: 0; font-size: 22px; letter-spacing: 2px; color: #087a86; }
  .sub { font-size: 11px; color: #666; letter-spacing: 1px; text-transform: uppercase; }
  .stats { display: flex; gap: 24px; margin: 20px 0; }
  .stat { text-align: center; }
  .stat .n { font-size: 28px; font-weight: 800; color: #087a86; }
  .stat .l { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
  th { text-align: left; background: #0a141e; color: #cfeef5; padding: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
  td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  .score { font-weight: 800; font-size: 15px; text-align: center; color: #888; width: 44px; }
  .score.hot { color: #d97706; }
  .dim { color: #94a3b8; font-size: 10px; }
  .status { text-transform: uppercase; font-size: 10px; color: #555; }
  footer { margin-top: 24px; font-size: 10px; color: #aaa; text-align: center; }
  @media print { body { margin: 12px; } }
</style></head><body>
<header>
  <div><h1>◈ NEXUS SCAN</h1><div class="sub">engenheiro.ai · relatório de oportunidades</div></div>
  <div class="sub">Setor: ${esc(setor)}</div>
</header>
<div class="stats">
  <div class="stat"><div class="n">${leads.length}</div><div class="l">Alvos</div></div>
  <div class="stat"><div class="n">${quentes}</div><div class="l">Alta prioridade</div></div>
</div>
<table>
  <thead><tr><th>Score</th><th>Negócio</th><th>Oportunidade</th><th>Reputação</th><th>Telefone</th><th>Status</th></tr></thead>
  <tbody>${linhas}</tbody>
</table>
<footer>Gerado pelo NEXUS SCAN · engenheiro.ai — dados públicos do Google Maps</footer>
<script>window.onload = () => window.print();</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
