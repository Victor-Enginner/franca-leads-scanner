import { describe, expect, it } from "vitest";
import { negocioEncerrado, type PlaceDetails } from "./places";
import { gerarMensagem, scoreOportunidade } from "./scoring";

const place: PlaceDetails = {
  place_id: "place-1",
  name: "Studio Exemplo",
  rating: 5,
  user_ratings_total: 10,
};

describe("score e mensagem de oportunidade", () => {
  it("prioriza negócio sem site, boa nota e poucas avaliações", () => {
    expect(scoreOportunidade(place)).toEqual({ score: 85, motivo: "sem_site" });
  });

  it("usa a cidade da varredura, sem fixar Franca", () => {
    const mensagem = gerarMensagem(place, "sem_site", "Itapema, SC", "manicure");

    expect(mensagem).toContain("Itapema, SC");
    expect(mensagem).toContain("pesquisando manicure");
    expect(mensagem).not.toContain("em Franca");
  });

  it("mantém o mesmo padrão de abordagem para todos os motivos", () => {
    const motivos = ["sem_site", "so_rede_social", "poucas_reviews", "geral"] as const;

    for (const motivo of motivos) {
      const mensagem = gerarMensagem(place, motivo, "Franca, SP", "salão de unhas");
      expect(mensagem).toMatch(/^Oi, tudo bem\? Encontrei/);
      expect(mensagem).toContain("Sou o Vitor, do engenheiro.ai");
      expect(mensagem).toContain("WhatsApp ou pelo Instagram?");
      expect(mensagem).not.toMatch(/mandar (um )?(exemplo|ideia)/i);
    }
  });

  it("identifica somente os status fechados da Places API", () => {
    expect(negocioEncerrado("CLOSED_PERMANENTLY")).toBe(true);
    expect(negocioEncerrado("CLOSED_TEMPORARILY")).toBe(true);
    expect(negocioEncerrado("OPERATIONAL")).toBe(false);
    expect(negocioEncerrado(undefined)).toBe(false);
  });
});
