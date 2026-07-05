import Anthropic from "@anthropic-ai/sdk";
import type { Lead } from "./supabase";
import type { SiteInfo } from "./enrich";

// A geração por IA só liga quando há chave. Sem ela, o app usa os
// templates de scoring.ts (retrocompatível — deploy seguro).
export function iaConfigurada(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM = `Você é o Vitor, do @engenheiro.ai — ajuda negócios locais a vender mais com site, automação de WhatsApp e presença digital. Escreve mensagens de PRIMEIRA abordagem por WhatsApp, em português do Brasil.

Regras da mensagem:
- Tom humano, caloroso e direto — como uma pessoa real escrevendo, não um robô.
- Curta: 2 a 4 frases. Nada de textão.
- Comece elogiando algo REAL e específico do negócio (nota, nº de avaliações, tempo de casa).
- Aponte a oportunidade digital de forma leve, sem soar crítica ("reparei que...", "só faltando...").
- Termine com uma pergunta de baixo compromisso ("posso te mostrar uma ideia rápida, sem compromisso?").
- Assine como "Vitor, do @engenheiro.ai".
- Não invente dados que não foram fornecidos. Não use emojis em excesso (no máximo 1).
- Responda APENAS com o texto da mensagem, sem aspas, sem preâmbulo.`;

function contexto(lead: Lead, site: SiteInfo): string {
  const linhas = [
    `Nome do negócio: ${lead.nome}`,
    `Nicho: ${lead.nicho}`,
    `Cidade: ${lead.cidade ?? "Franca, SP"}`,
    `Nota no Google: ${lead.rating ?? "sem nota"}`,
    `Nº de avaliações: ${lead.qtd_reviews ?? 0}`,
    `Motivo da abordagem: ${lead.motivo_abordagem}`,
  ];
  if (!site.temSite) {
    linhas.push("Situação digital: NÃO tem site próprio (só aparece no Google/Maps).");
  } else if (site.ehRedeSocial) {
    linhas.push("Situação digital: só tem rede social (Instagram/Facebook), sem site próprio.");
  } else if (site.noAr === false) {
    linhas.push("Situação digital: TEM site, mas ele está FORA DO AR / não carrega — gancho forte.");
  } else {
    linhas.push("Situação digital: tem site próprio funcionando; foque em automação/conversão.");
  }
  return linhas.join("\n");
}

/**
 * Gera a mensagem de abordagem personalizada via Claude.
 * Modelo: claude-opus-4-8 (padrão da referência). Sem thinking e
 * max_tokens baixo pra ser rápido/barato numa geração curta e repetida.
 */
export async function gerarMensagemIA(
  lead: Lead,
  site: SiteInfo
): Promise<string> {
  const client = new Anthropic();
  const resp = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 512,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Escreva a mensagem de abordagem para este lead:\n\n${contexto(lead, site)}`,
      },
    ],
  });

  const texto = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (!texto) throw new Error("IA retornou resposta vazia");
  return texto;
}
