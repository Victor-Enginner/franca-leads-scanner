import type { PlaceDetails } from "./places";

export type Motivo = "sem_site" | "so_rede_social" | "poucas_reviews" | "geral";

const MENSAGENS: Record<Motivo, string> = {
  sem_site:
    "Oi, tudo bem? Encontrei o {nome} pesquisando em {cidade} e vi a boa " +
    "reputação de vocês: nota {rating} em {qtd_reviews} avaliações. Percebi " +
    "que o perfil do Google ainda não tem um site próprio vinculado. Sou o " +
    "Vitor, do engenheiro.ai, e ajudo negócios locais a organizar presença " +
    "digital e atendimento pelo WhatsApp. Hoje os novos contatos de vocês " +
    "chegam mais pelo WhatsApp ou pelo Instagram?",
  so_rede_social:
    "Oi, tudo bem? Encontrei o {nome} em {cidade} e vi a reputação de " +
    "vocês no Google: nota {rating} em {qtd_reviews} avaliações. Reparei " +
    "que o principal link do perfil leva ao Instagram. Sou o Vitor, do " +
    "engenheiro.ai, e ajudo negócios locais a transformar essas buscas em " +
    "conversas e agendamentos. Hoje os novos contatos de vocês chegam mais " +
    "pelo WhatsApp ou pelo Instagram?",
  poucas_reviews:
    "Oi, tudo bem? Encontrei o {nome} em {cidade} e vi a ótima nota de " +
    "{rating}, com {qtd_reviews} avaliações no Google. Sou o Vitor, do " +
    "engenheiro.ai, e ajudo negócios locais a organizar o atendimento e a " +
    "presença digital para aproveitar melhor cada cliente satisfeito. Vocês " +
    "já têm algum processo para pedir avaliações depois do atendimento?",
  geral:
    "Oi, tudo bem? Encontrei o {nome} em {cidade} e vi a reputação de " +
    "vocês no Google. Sou o Vitor, do engenheiro.ai, e ajudo negócios locais " +
    "a organizar presença digital e atendimento no WhatsApp para transformar " +
    "pedidos em agendamentos. Hoje os novos contatos de vocês chegam mais " +
    "pelo WhatsApp ou pelo Instagram?",
};

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

export function gerarMensagem(
  place: PlaceDetails,
  motivo: Motivo,
  cidade = "sua cidade"
): string {
  return MENSAGENS[motivo]
    .replaceAll("{nome}", place.name ?? "")
    .replaceAll("{rating}", String(place.rating ?? "-"))
    .replaceAll("{qtd_reviews}", String(place.user_ratings_total ?? "-"))
    .replaceAll("{cidade}", cidade);
}
