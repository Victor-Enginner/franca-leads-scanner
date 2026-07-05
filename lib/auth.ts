import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

/**
 * O modo multiusuário só liga quando as variáveis públicas existem.
 * Sem elas, o app roda exatamente como antes (single-user, sem login) —
 * isso permite deployar o código sem quebrar a produção atual.
 */
export function authConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Usuário logado da requisição atual (via cookie de sessão), ou null. */
export async function getUsuario(): Promise<User | null> {
  if (!authConfigurado()) return null;
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Leitura apenas: renovação de sessão acontece no client.
        setAll: () => {},
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
