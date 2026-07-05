// Enriquecimento leve de lead — sem dependências externas, só fetch.

const REDES = ["instagram.com", "facebook.com", "linktr.ee", "linktree", "wa.me", "bit.ly"];

export type SiteInfo = {
  temSite: boolean;
  ehRedeSocial: boolean;
  noAr: boolean | null; // null = não checado (sem URL http)
};

export function ehRedeSocial(url: string): boolean {
  const u = url.toLowerCase();
  return REDES.some((d) => u.includes(d));
}

/**
 * Checa se o site do lead responde. HEAD com timeout curto — se cair ou
 * der erro, marca noAr=false (oportunidade: "seu site está fora do ar").
 * Só roda pra URLs http reais, não pra links de rede social.
 */
export async function checarSite(site: string | null): Promise<SiteInfo> {
  if (!site) return { temSite: false, ehRedeSocial: false, noAr: null };
  if (ehRedeSocial(site)) return { temSite: true, ehRedeSocial: true, noAr: null };

  const url = site.startsWith("http") ? site : `https://${site}`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return { temSite: true, ehRedeSocial: false, noAr: resp.ok };
  } catch {
    // timeout / DNS / conexão recusada → provavelmente fora do ar
    return { temSite: true, ehRedeSocial: false, noAr: false };
  }
}
