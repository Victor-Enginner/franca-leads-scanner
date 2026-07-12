// Enriquecimento leve de lead. URLs vêm de fontes externas, portanto toda
// consulta de site precisa bloquear destinos internos e redirects inseguros.
import { isIP } from "node:net";
import { resolve4, resolve6 } from "node:dns/promises";

const REDES = ["instagram.com", "facebook.com", "linktr.ee", "linktree", "wa.me", "bit.ly"];
const MAX_REDIRECTS = 3;

export type SiteInfo = {
  temSite: boolean;
  ehRedeSocial: boolean;
  noAr: boolean | null;
  bloqueado?: boolean;
};

export function ehRedeSocial(url: string): boolean {
  const u = url.toLowerCase();
  return REDES.some((d) => u.includes(d));
}

function ipPrivado(ip: string): boolean {
  if (ip === "::1" || ip === "::") return true;
  if (ip.includes(":")) return /^(fc|fd|fe80:|::ffff:127\.)/i.test(ip);
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

export function normalizarUrlSegura(site: string): URL | null {
  try {
    const url = new URL(site.startsWith("http") ? site : `https://${site}`);
    const host = url.hostname.toLowerCase();
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    if (!host || host === "localhost" || host.endsWith(".local")) return null;
    if (isIP(host) && ipPrivado(host)) return null;
    return url;
  } catch {
    return null;
  }
}

async function destinoPublico(host: string): Promise<boolean> {
  if (isIP(host)) return !ipPrivado(host);
  try {
    const ips = [...await resolve4(host).catch(() => []), ...await resolve6(host).catch(() => [])];
    return ips.length > 0 && ips.every((ip) => !ipPrivado(ip));
  } catch {
    return false;
  }
}

/** Checa disponibilidade sem seguir redirects para destinos não validados. */
export async function checarSite(site: string | null): Promise<SiteInfo> {
  if (!site) return { temSite: false, ehRedeSocial: false, noAr: null };
  if (ehRedeSocial(site)) return { temSite: true, ehRedeSocial: true, noAr: null };

  let url = normalizarUrlSegura(site);
  if (!url || !(await destinoPublico(url.hostname))) {
    return { temSite: true, ehRedeSocial: false, noAr: null, bloqueado: true };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    for (let tentativa = 0; tentativa <= MAX_REDIRECTS; tentativa++) {
      const resp = await fetch(url, { method: "HEAD", redirect: "manual", signal: ctrl.signal });
      if (resp.status < 300 || resp.status >= 400) {
        return { temSite: true, ehRedeSocial: false, noAr: resp.ok };
      }
      const location = resp.headers.get("location");
      if (!location || tentativa === MAX_REDIRECTS) {
        return { temSite: true, ehRedeSocial: false, noAr: null, bloqueado: true };
      }
      const proximo = normalizarUrlSegura(new URL(location, url).toString());
      if (!proximo || !(await destinoPublico(proximo.hostname))) {
        return { temSite: true, ehRedeSocial: false, noAr: null, bloqueado: true };
      }
      url = proximo;
    }
    return { temSite: true, ehRedeSocial: false, noAr: null };
  } catch {
    return { temSite: true, ehRedeSocial: false, noAr: false };
  } finally {
    clearTimeout(timer);
  }
}
