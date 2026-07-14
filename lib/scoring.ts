import type { PlaceDetails } from "./places";

export type Motivo = "sem_site" | "so_rede_social" | "poucas_reviews" | "geral";

const OPORTUNIDADE: Record<Motivo, string> = {
  sem_site:
    "Percebi que o perfil do Google ainda não tem um site próprio vinculado, o que pode dificultar que uma busca vire atendimento.",
  so_rede_social:
    "Reparei que o principal link do perfil leva ao Instagram, e há espaço para transformar essas buscas em conversas e agendamentos.",
  poucas_reviews:
    "A nota é muito boa; há espaço para aproveitar melhor cada cliente satisfeito e fortalecer essa reputação no Google.",
  geral:
    "Queria entender como está hoje a presença digital e o atendimento de vocês.",
};

const PERGUNTA_FINAL =
  "Hoje os novos contatos de vocês chegam mais pelo WhatsApp ou pelo Instagram?";

function ehRedeSocial(url: string): boolean {
  const dominios = ["instagram.com", "facebook.com", "linktr.ee"];
  return dominios.some((d) => url.toLowerCase().includes(d));
}

export function scoreOportunidade(place: PlaceDetails): {
  score: number;
  motivo: Motivo;
} {
  const website = place.website ?? "";
  const rating = place.rating ?? 0;
  const totalReviews = place.user_ratings_total ?? 0;

  let score = 0;
  let motivo: Motivo = "geral";

  if (!website) {
    score += 45;
    motivo = "sem_site";
  } else if (ehRedeSocial(website)) {
    score += 30;
    motivo = "so_rede_social";
  } else if (!website.toLowerCase().startsWith("https://")) {
    score += 20;
    motivo = "so_rede_social";
  }

  if (totalReviews < 15) {
    score += 25;
    if (motivo === "geral") motivo = "poucas_reviews";
  } else if (totalReviews < 50) {
    score += 10;
  }

  if (rating >= 4.5 && totalReviews < 30) {
    score += 15;
    if (motivo === "geral") motivo = "poucas_reviews";
  }

  return { score: Math.min(score, 100), motivo };
}

function resumoDaReputacao(place: PlaceDetails): string {
  const rating = place.rating;
  const reviews = place.user_ratings_total;
  if (typeof rating === "number" && typeof reviews === "number") {
    return `vi a reputação de vocês no Google: nota ${rating} em ${reviews} avaliações.`;
  }
  return "vi o perfil de vocês no Google.";
}

/**
 * Mensagem inicial padronizada: contexto real, apresentação breve,
 * oportunidade observável e pergunta de diagnóstico. A proposta só entra
 * depois da resposta humana do negócio.
 */
export function gerarMensagem(
  place: PlaceDetails,
  motivo: Motivo,
  cidade = "sua cidade",
  nicho = "negócios locais"
): string {
  const nichoDaBusca = nicho.trim() || "negócios locais";
  const cidadeDaBusca = cidade.trim() || "sua cidade";
  const nome = place.name?.trim() || "seu negócio";

  return [
    `Oi, tudo bem? Encontrei ${nome} pesquisando ${nichoDaBusca} em ${cidadeDaBusca} e ${resumoDaReputacao(place)}`,
    `Sou o Vitor, do engenheiro.ai, e ajudo negócios locais a organizar presença digital e atendimento no WhatsApp. ${OPORTUNIDADE[motivo]}`,
    PERGUNTA_FINAL,
  ].join(" ");
}
