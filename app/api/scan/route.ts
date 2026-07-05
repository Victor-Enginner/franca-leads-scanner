import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  supabaseConfigurado,
} from "@/lib/supabase";
import { buscarNicho, detalhesDoLugar } from "@/lib/places";
import { scoreOportunidade, gerarMensagem } from "@/lib/scoring";
import { authConfigurado, getUsuario } from "@/lib/auth";
import { getOuCriarPerfil, consumirVarredura } from "@/lib/perfil";

export const maxDuration = 60; // varredura pode levar um tempinho

type ScanBody = {
  nichos: string[];
  cidade?: string;
  maxPorNicho?: number;
};

export async function POST(req: NextRequest) {
  let body: ScanBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const nichos = body.nichos?.filter(Boolean);
  if (!nichos || nichos.length === 0) {
    return NextResponse.json(
      { error: "Envie ao menos um nicho em `nichos`" },
      { status: 400 }
    );
  }

  const cidade = body.cidade ?? "Franca, SP";
  const maxPorNicho = body.maxPorNicho ?? 20;

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
  const resumo: { nicho: string; encontrados: number; salvos: number }[] = [];
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

      for (const r of resultados) {
        try {
          const detalhes = await detalhesDoLugar(r.place_id);
          const { score, motivo } = scoreOportunidade(detalhes);
          const mensagem = gerarMensagem(detalhes, motivo);

          const { error } = await supabase.from("leads").upsert(
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
          );

          if (error) throw error;
          salvos += 1;

          // respeita rate limit da Places API
          await new Promise((resolve) => setTimeout(resolve, 150));
        } catch (innerErr) {
          erros.push(
            `Falha ao processar place_id ${r.place_id}: ${descreverErro(innerErr)}`
          );
        }
      }

      resumo.push({ nicho, encontrados: resultados.length, salvos });
    } catch (nichoErr) {
      erros.push(`Falha ao buscar nicho "${nicho}": ${descreverErro(nichoErr)}`);
    }
  }

  if (userId) await consumirVarredura(userId);

  return NextResponse.json({ resumo, erros });
}
