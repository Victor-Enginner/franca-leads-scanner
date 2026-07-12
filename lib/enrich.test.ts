import { describe, expect, it } from "vitest";
import { normalizarUrlSegura } from "./enrich";

describe("normalizarUrlSegura", () => {
  it("aceita sites HTTPS públicos", () => {
    expect(normalizarUrlSegura("https://exemplo.com")?.hostname).toBe("exemplo.com");
  });

  it("bloqueia localhost, IPs privados e credenciais embutidas", () => {
    expect(normalizarUrlSegura("http://localhost:3000")).toBeNull();
    expect(normalizarUrlSegura("http://192.168.0.1")).toBeNull();
    expect(normalizarUrlSegura("https://user:pass@exemplo.com")).toBeNull();
  });
});
