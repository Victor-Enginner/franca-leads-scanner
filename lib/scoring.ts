import type { PlaceDetails } from "./places";

export type Motivo = "sem_site" | "so_rede_social" | "poucas_reviews" | "geral";

const MENSAGENS: Record<Motivo, string> = {
  sem_site:
    "Oi! Vi o {nome} aqui em Franca — {qtd_reviews} avaliações, nota {rating}, " +
    "mas sem site próprio ainda. Isso é cliente indo pra concorrência que " +
    "aparece primeiro no Google. Faço sites simples e rápidos, com automação " +
    "de WhatsApp incluída. Posso te mostrar um exemplo de como ficaria o de " +
    "vocês, sem compromisso?",
  so_rede_social:
    "Oi! Vi o {nome} — {qtd_reviews} avaliações, nota {rating}, mas o único " +
    "link que aparece no Google é o Instagram. Um site próprio (mesmo " +
    "simples) ajuda a converter muito mais quem já gostou do trabalho de " +
    "vocês. Posso te mandar uma ideia rápida?",
  poucas_reviews:
    "Oi! Vi o {nome} aqui em Franca, ótima nota ({rating}⭐) mas pouca gente " +
    "avaliando ainda — isso é oportunidade perdida no Google. Ajudo " +
    "negócios locais a aparecer mais e converter mais avaliação em cliente " +
    "novo. Topa ver uma ideia rápida?",
  geral:
    "Oi! Vi o {nome} aqui em Franca. Ajudo negócios locais a vender mais " +
    "com automação de WhatsApp, Instagram e presença digital — posso te " +
    "mandar um exemplo rápido do que consigo fazer pro seu ramo?",
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

export function gerarMensagem(place: PlaceDetails, motivo: Motivo): string {
  return MENSAGENS[motivo]
    .replaceAll("{nome}", place.name ?? "")
    .replaceAll("{rating}", String(place.rating ?? "-"))
    .replaceAll("{qtd_reviews}", String(place.user_ratings_total ?? "-"));
}
