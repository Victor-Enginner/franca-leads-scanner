import { NextRequest, NextResponse } from "next/server";
import { geocodificarCidade } from "@/lib/places";

// Coordenadas de fallback (Franca/SP) pro modo demo, sem Google key.
const FRANCA = { nome: "Franca, São Paulo", lat: -20.5386, lon: -47.4008 };

export async function GET(req: NextRequest) {
  const cidade = new URL(req.url).searchParams.get("cidade")?.trim();

  if (!cidade) {
    return NextResponse.json(
      { error: "Informe ?cidade=Nome da Cidade" },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ ...FRANCA, demo: true });
  }

  try {
    const geo = await geocodificarCidade(cidade);
    return NextResponse.json(geo);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 404 }
    );
  }
}
