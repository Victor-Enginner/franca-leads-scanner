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
    const mensagem = gerarMensagem(place, "sem_site", "Itapema, SC");

    expect(mensagem).toContain("Itapema, SC");
    expect(mensagem).not.toContain("em Franca");
  });

  it("identifica somente os status fechados da Places API", () => {
    expect(negocioEncerrado("CLOSED_PERMANENTLY")).toBe(true);
    expect(negocioEncerrado("CLOSED_TEMPORARILY")).toBe(true);
    expect(negocioEncerrado("OPERATIONAL")).toBe(false);
    expect(negocioEncerrado(undefined)).toBe(false);
  });
});
