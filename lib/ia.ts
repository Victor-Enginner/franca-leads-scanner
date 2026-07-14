import type { Lead } from "./supabase";
import type { SiteInfo } from "./enrich";

// Geração de mensagens via Groq (grátis, sem cartão). Roda Llama 3.3 70B.
// A geração só liga quando há chave — sem ela, usa os templates de
// scoring.ts (retrocompatível). API compatível com OpenAI.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO = "llama-3.3-70b-versatile";

export function iaConfigurada(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

const SYSTEM = `Você é o Vitor, do @engenheiro.ai — ajuda negócios locais a vender mais com site, automação de WhatsApp e presença digital. Escreve mensagens de PRIMEIRA abordagem por WhatsApp, em português do Brasil.

Regras da mensagem:
- Tom humano, caloroso e direto — como uma pessoa real escrevendo, não um robô.
- Use exatamente esta estrutura em três frases: (1) "Oi, tudo bem? Encontrei
  [negócio] pesquisando [nicho] em [cidade] e vi [fato real do Google]." (2)
  "Sou o Vitor, do engenheiro.ai, e ajudo negócios locais a organizar presença
  digital e atendimento no WhatsApp. [oportunidade factual e leve]." (3)
  "Hoje os novos contatos de vocês chegam mais pelo WhatsApp ou pelo Instagram?"
- A oportunidade deve ser observável e leve; não critique o negócio nem prometa resultados.
- Apresente-se somente na segunda frase como "Sou o Vitor, do engenheiro.ai";
  não acrescente assinatura ao fim.
- Não invente dados que não foram fornecidos. Não use emojis em excesso (no máximo 1).
- Nunca termine oferecendo "mandar um exemplo", "mandar uma ideia", "mostrar
  como ficaria" ou usando "topa conversar?". A primeira mensagem deve abrir
  diálogo, não tentar apresentar uma proposta.
- Responda APENAS com o texto da mensagem, sem aspas, sem preâmbulo, sem explicação.`;

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
    linhas.push(site.bloqueado
      ? "Situação digital: site não foi analisado por segurança; não faça alegações sobre disponibilidade."
      : "Situação digital: tem site próprio funcionando; foque em automação/conversão.");
  }
  return linhas.join("\n");
}

export async function gerarMensagemIA(
  lead: Lead,
  site: SiteInfo
): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  const resp = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODELO,
      temperature: 0.85,
      max_tokens: 400,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Escreva a mensagem de abordagem para este lead:\n\n${contexto(lead, site)}`,
        },
      ],
    }),
    signal: ctrl.signal,
  });
  clearTimeout(timer);

  if (!resp.ok) {
    const detalhe = await resp.text().catch(() => "");
    throw new Error(`Groq retornou ${resp.status}: ${detalhe.slice(0, 120)}`);
  }

  const data = await resp.json();
  const texto = String(data.choices?.[0]?.message?.content ?? "").trim();
  if (!texto) throw new Error("IA retornou resposta vazia");
  return texto;
}
