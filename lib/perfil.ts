import { getSupabaseServerClient } from "./supabase";

export type Perfil = {
  user_id: string;
  email: string;
  plano: string;
  varreduras_limite: number;
  varreduras_usadas: number;
  ciclo_inicio: string;
};

const PLANO_PADRAO = { plano: "beta", varreduras_limite: 10 };

/** Busca (ou cria) o perfil do usuário, resetando o ciclo mensal se virou o mês. */
export async function getOuCriarPerfil(
  userId: string,
  email: string
): Promise<Perfil> {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("perfis")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    const novo = {
      user_id: userId,
      email,
      ...PLANO_PADRAO,
      varreduras_usadas: 0,
      ciclo_inicio: new Date().toISOString().slice(0, 10),
    };
    const { data: criado, error } = await supabase
      .from("perfis")
      .insert(novo)
      .select()
      .single();
    if (error) throw error;
    return criado as Perfil;
  }

  const perfil = data as Perfil;

  // Virou o mês → renova a cota.
  const cicloMes = perfil.ciclo_inicio?.slice(0, 7);
  const mesAtual = new Date().toISOString().slice(0, 7);
  if (cicloMes !== mesAtual) {
    const { data: renovado, error } = await supabase
      .from("perfis")
      .update({
        varreduras_usadas: 0,
        ciclo_inicio: new Date().toISOString().slice(0, 10),
      })
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return renovado as Perfil;
  }

  return perfil;
}

export async function consumirVarredura(userId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("perfis")
    .select("varreduras_usadas")
    .eq("user_id", userId)
    .single();
  await supabase
    .from("perfis")
    .update({ varreduras_usadas: (data?.varreduras_usadas ?? 0) + 1 })
    .eq("user_id", userId);
}
