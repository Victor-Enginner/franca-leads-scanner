import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  supabaseConfigurado,
} from "@/lib/supabase";
import { buscarNicho, detalhesDoLugar, negocioEncerrado } from "@/lib/places";
import { scoreOportunidade, gerarMensagem } from "@/lib/scoring";
import { authConfigurado, getUsuario } from "@/lib/auth";
import { getOuCriarPerfil, consumirVarredura } from "@/lib/perfil";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  concluirVarredura,
  criarVarredura,
  obterOuCriarJornadaAtiva,
  vincularLeadAVarredura,
} from "@/lib/jornadas";
import type { Lead } from "@/lib/supabase";

export const maxDuration = 60; // varredura pode levar um tempinho

type ScanBody = {
  nichos: string[];
  cidade?: string;
  maxPorNicho?: number;
};

const MAX_NICHOS = 12;
const MAX_CHARS_NICHO = 80;
const MAX_CHARS_CIDADE = 100;
const MAX_POR_NICHO = 20;
const MAX_VARREDURAS_POR_HORA = 5;
const JANELA_VARREDURA_MS = 60 * 60 * 1000;

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  let body: ScanBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!Array.isArray(body.nichos)) {
    return NextResponse.json(
      { error: "Envie `nichos` como uma lista de texto" },
      { status: 400 }
    );
  }

  const nichos = [...new Set(
    body.nichos
      .filter((n): n is string => typeof n === "string")
      .map((n) => n.trim())
      .filter(Boolean)
  )];
  if (
    nichos.length === 0 ||
    nichos.length > MAX_NICHOS ||
    nichos.some((n) => n.length > MAX_CHARS_NICHO)
  ) {
    return NextResponse.json(
      {
        error:
          `Envie entre 1 e ${MAX_NICHOS} nichos, com até ${MAX_CHARS_NICHO} caracteres cada.`,
      },
      { status: 400 }
    );
  }

  if (body.cidade !== undefined && typeof body.cidade !== "string") {
    return NextResponse.json({ error: "cidade precisa ser texto" }, { status: 400 });
  }
  const cidade = (body.cidade ?? "Franca, SP").trim();
  if (!cidade || cidade.length > MAX_CHARS_CIDADE) {
    return NextResponse.json(
      { error: `cidade precisa ter até ${MAX_CHARS_CIDADE} caracteres` },
      { status: 400 }
    );
  }

  if (
    body.maxPorNicho !== undefined &&
    (!Number.isInteger(body.maxPorNicho) ||
      body.maxPorNicho < 1 ||
      body.maxPorNicho > MAX_POR_NICHO)
  ) {
    return NextResponse.json(
      { error: `maxPorNicho precisa ser um inteiro entre 1 e ${MAX_POR_NICHO}` },
      { status: 400 }
    );
  }
  const maxPorNicho = body.maxPorNicho ?? MAX_POR_NICHO;

  if (!supabaseConfigurado()) {
    return NextResponse.json(
      {
        error:
          "Modo demo: configure Google Places + Supabase no .env pra rodar " +
          "varreduras reais.",
      },
      { status: 400 }
    );
  }

  const rateLimit = consumeRateLimit(
    `scan:${clientKey(req)}`,
    MAX_VARREDURAS_POR_HORA,
    JANELA_VARREDURA_MS
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Limite temporário de varreduras atingido. Tente novamente mais tarde.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  // Modo multiusuário: exige login e respeita a cota do plano.
  let userId: string | null = null;
  if (authConfigurado()) {
    const usuario = await getUsuario();
    if (!usuario) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    const perfil = await getOuCriarPerfil(usuario.id, usuario.email ?? "");
    if (perfil.varreduras_usadas >= perfil.varreduras_limite) {
      return NextResponse.json(
        {
          error:
            `Limite do plano ${perfil.plano} atingido ` +
            `(${perfil.varreduras_limite} varreduras/mês). ` +
            "Fale com o suporte pra ampliar.",
        },
        { status: 429 }
      );
    }
    userId = usuario.id;
  }

  const supabase = getSupabaseServerClient();
  let jornada: { id: string };
  let varredura: { id: string };
  try {
    jornada = await obterOuCriarJornadaAtiva(supabase, cidade, userId);
    varredura = await criarVarredura(
      supabase,
      jornada.id,
      cidade,
      nichos,
      maxPorNicho
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível iniciar a jornada de trabalho." },
      { status: 500 }
    );
  }
  const resumo: {
    nicho: string;
    encontrados: number;
    salvos: number;
    ignorados: number;
  }[] = [];
  const erros: string[] = [];

  // Erros do Supabase são objetos planos — String() vira "[object Object]".
  const descreverErro = (e: unknown): string => {
    if (e instanceof Error) return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  };

  for (const nicho of nichos) {
    try {
      const resultados = await buscarNicho(nicho, cidade, maxPorNicho);
      let salvos = 0;
      let ignorados = 0;

      for (const r of resultados) {
        try {
          const detalhes = await detalhesDoLugar(r.place_id);
          if (negocioEncerrado(detalhes.business_status)) {
            ignorados += 1;
            continue;
          }
          const { score, motivo } = scoreOportunidade(detalhes);
          const mensagem = gerarMensagem(detalhes, motivo, cidade);

          const { data: leadSalvo, error } = await supabase.from("leads").upsert(
            {
              place_id: detalhes.place_id,
              nicho,
              nome: detalhes.name,
              endereco: detalhes.formatted_address ?? null,
              telefone: detalhes.formatted_phone_number ?? null,
              site: detalhes.website ?? null,
              rating: detalhes.rating ?? null,
              qtd_reviews: detalhes.user_ratings_total ?? null,
              score_oportunidade: score,
              motivo_abordagem: motivo,
              mensagem_sugerida: mensagem,
              lat: detalhes.geometry?.location?.lat ?? null,
              lon: detalhes.geometry?.location?.lng ?? null,
              cidade,
              ...(userId ? { user_id: userId } : {}),
            },
            {
              // Multiusuário: cada operador tem seu próprio universo de
              // leads — o mesmo negócio pode existir pra dois usuários.
              onConflict: userId ? "user_id,place_id" : "place_id",
              ignoreDuplicates: false,
            }
          ).select("*").single();

          if (error) throw error;
          if (!leadSalvo) throw new Error("Lead não retornado após salvar");
          await vincularLeadAVarredura(supabase, {
            varreduraId: varredura.id,
            lead: leadSalvo as Lead,
          });
          salvos += 1;

          // respeita rate limit da Places API
          await new Promise((resolve) => setTimeout(resolve, 150));
        } catch (innerErr) {
          erros.push(
            `Falha ao processar place_id ${r.place_id}: ${descreverErro(innerErr)}`
          );
        }
      }

      resumo.push({ nicho, encontrados: resultados.length, salvos, ignorados });
    } catch (nichoErr) {
      erros.push(`Falha ao buscar nicho "${nicho}": ${descreverErro(nichoErr)}`);
    }
  }

  const totais = resumo.reduce(
    (acc, item) => ({
      encontrados: acc.encontrados + item.encontrados,
      salvos: acc.salvos + item.salvos,
      ignorados: acc.ignorados + item.ignorados,
    }),
    { encontrados: 0, salvos: 0, ignorados: 0 }
  );
  try {
    await concluirVarredura(supabase, varredura.id, totais, erros);
  } catch (error) {
    erros.push(`Falha ao concluir histórico da varredura: ${descreverErro(error)}`);
  }

  if (userId) await consumirVarredura(userId);

  return NextResponse.json({ resumo, erros, jornadaId: jornada.id, varreduraId: varredura.id });
}
