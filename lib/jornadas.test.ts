import { describe, expect, it } from "vitest";
import { jornadaExpirada } from "./jornadas";

describe("jornadaExpirada", () => {
  it("permanece na mesma jornada antes de 12 horas", () => {
    expect(
      jornadaExpirada("2026-07-12T12:00:00.000Z", new Date("2026-07-12T11:59:59.999Z"))
    ).toBe(false);
  });

  it("abre nova jornada exatamente ao vencer", () => {
    expect(
      jornadaExpirada("2026-07-12T12:00:00.000Z", new Date("2026-07-12T12:00:00.000Z"))
    ).toBe(true);
  });
});
