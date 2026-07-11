import { NextRequest, NextResponse } from "next/server";

const REALM = "NEXUS SCAN";

function unauthorized(message = "Acesso restrito ao operador.") {
  return new NextResponse(message, {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

function sameValue(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

/**
 * Bloqueio temporário de operação interna.
 *
 * Em produção, a senha é obrigatória e a aplicação falha fechada: se ela
 * não estiver definida no ambiente, nenhum dado ou endpoint fica público.
 * Em desenvolvimento local, sem senha, o modo demo continua utilizável.
 */
export function middleware(request: NextRequest) {
  const password = process.env.APP_ACCESS_PASSWORD;
  const username = process.env.APP_ACCESS_USERNAME || "operator";
  const mustProtect = process.env.NODE_ENV === "production" || Boolean(password);

  if (!mustProtect) return NextResponse.next();
  if (!password) return unauthorized("Proteção de produção não configurada.");

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return unauthorized();

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return unauthorized();

    const suppliedUsername = decoded.slice(0, separator);
    const suppliedPassword = decoded.slice(separator + 1);
    if (
      !sameValue(suppliedUsername, username) ||
      !sameValue(suppliedPassword, password)
    ) {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
