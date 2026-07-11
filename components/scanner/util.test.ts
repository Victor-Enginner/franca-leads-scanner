import { describe, expect, it } from "vitest";
import type { Lead } from "@/lib/supabase";
import { waHref } from "./util";

const lead: Lead = {
  id: "lead-1",
  place_id: "place-1",
  nicho: "salão",
  nome: "Studio Exemplo",
  endereco: null,
  telefone: "(16) 99999-1234",
  site: null,
  rating: 5,
  qtd_reviews: 10,
  score_oportunidade: 85,
  motivo_abordagem: "sem_site",
  mensagem_sugerida: "Olá, Studio Exemplo!",
  status: "não contatado",
  lat: null,
  lon: null,
  cidade: "Franca, SP",
  notas: null,
  criado_em: "2026-07-10T00:00:00.000Z",
  atualizado_em: "2026-07-10T00:00:00.000Z",
};

describe("link manual de WhatsApp", () => {
  it("normaliza telefone brasileiro e preenche a mensagem", () => {
    const href = waHref(lead);

    expect(href).toContain("https://wa.me/5516999991234");
    expect(href).toContain(encodeURIComponent(lead.mensagem_sugerida));
  });

  it("não cria link quando o telefone é inválido", () => {
    expect(waHref({ ...lead, telefone: "123" })).toBeNull();
  });
});
