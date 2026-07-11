const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

export type PlaceSummary = {
  place_id: string;
};

export type PlaceDetails = {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  geometry?: {
    location?: { lat: number; lng: number };
  };
};

export function negocioEncerrado(status?: string): boolean {
  return status === "CLOSED_PERMANENTLY" || status === "CLOSED_TEMPORARILY";
}

function apiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_PLACES_API_KEY não definida no .env");
  }
  return key;
}

/**
 * Busca lugares por texto livre (ex: "barbearia em Franca, SP").
 * Pagina automaticamente até atingir maxResultados (a API devolve até
 * 20 por página, no máximo 60 no total).
 */
export async function buscarNicho(
  nicho: string,
  cidade: string,
  maxResultados = 20
): Promise<PlaceSummary[]> {
  const query = encodeURIComponent(`${nicho} em ${cidade}`);
  let url = `${PLACES_BASE}/textsearch/json?query=${query}&language=pt-BR&key=${apiKey()}`;

  const resultados: PlaceSummary[] = [];

  while (resultados.length < maxResultados) {
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Places API (textsearch) retornou: ${data.status}`);
    }

    for (const r of data.results ?? []) {
      resultados.push({ place_id: r.place_id });
    }

    if (!data.next_page_token || resultados.length >= maxResultados) break;

    // A API exige um pequeno delay antes que o next_page_token fique válido.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    url = `${PLACES_BASE}/textsearch/json?pagetoken=${data.next_page_token}&key=${apiKey()}`;
  }

  return resultados.slice(0, maxResultados);
}

export type CidadeGeo = {
  nome: string;
  lat: number;
  lon: number;
};

/**
 * Resolve o nome de uma cidade para coordenadas usando o próprio Text
 * Search do Places (mesma API key, sem precisar ativar a Geocoding API).
 */
export async function geocodificarCidade(cidade: string): Promise<CidadeGeo> {
  const query = encodeURIComponent(cidade);
  const url = `${PLACES_BASE}/textsearch/json?query=${query}&language=pt-BR&key=${apiKey()}`;
  const resp = await fetch(url);
  const data = await resp.json();

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error(`Cidade não encontrada: "${cidade}" (${data.status})`);
  }

  const r = data.results[0];
  const lat = r.geometry?.location?.lat;
  const lon = r.geometry?.location?.lng;
  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new Error(`Cidade sem coordenadas: "${cidade}"`);
  }

  return { nome: r.formatted_address ?? r.name ?? cidade, lat, lon };
}

const CAMPOS = [
  "name",
  "formatted_address",
  "formatted_phone_number",
  "website",
  "rating",
  "user_ratings_total",
  "business_status",
  "geometry",
].join(",");

export async function detalhesDoLugar(placeId: string): Promise<PlaceDetails> {
  const url = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=${CAMPOS}&language=pt-BR&key=${apiKey()}`;
  const resp = await fetch(url);
  const data = await resp.json();

  if (data.status !== "OK") {
    throw new Error(`Places API (details) retornou: ${data.status}`);
  }

  return { place_id: placeId, ...data.result };
}
