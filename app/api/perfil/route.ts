import { NextResponse } from "next/server";
import { authConfigurado, getUsuario } from "@/lib/auth";
import { getOuCriarPerfil } from "@/lib/perfil";

export async function GET() {
  if (!authConfigurado()) {
    // Modo legado/single-user: sem conceito de plano.
    return NextResponse.json({ perfil: null });
  }
  const usuario = await getUsuario();
  if (!usuario) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }
  try {
    const perfil = await getOuCriarPerfil(usuario.id, usuario.email ?? "");
    return NextResponse.json({
      perfil: {
        plano: perfil.plano,
        varreduras_limite: perfil.varreduras_limite,
        varreduras_usadas: perfil.varreduras_usadas,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
