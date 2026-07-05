"use client";

import { useState } from "react";
import { getSupabaseBrowser, authAtivoNoCliente } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [modo, setModo] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const ativo = authAtivoNoCliente();

  async function autenticar() {
    if (!ativo || carregando) return;
    setErro("");
    setAviso("");
    setCarregando(true);
    try {
      const supabase = getSupabaseBrowser();
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (error) throw error;
        window.location.href = "/";
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
        });
        if (error) throw error;
        if (data.session) {
          window.location.href = "/";
        } else {
          setAviso("Conta criada — confirme o e-mail que enviamos e faça login.");
          setModo("login");
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErro(
        msg.includes("Invalid login credentials")
          ? "E-mail ou senha incorretos."
          : msg
      );
    } finally {
      setCarregando(false);
    }
  }

  const inputCls =
    "w-full rounded-sm border border-grid bg-void-2 p-3 font-body text-sm text-text-primary outline-none transition-shadow placeholder:text-text-dim focus:border-cyan focus:shadow-[0_0_0_1px_#00f0ff,0_0_16px_rgba(0,240,255,0.2)]";

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3.5">
          <svg viewBox="0 0 40 40" fill="none" className="h-10 w-10">
            <circle cx="20" cy="20" r="18" stroke="#00f0ff" strokeWidth="1" opacity="0.4" />
            <circle cx="20" cy="20" r="12" stroke="#00f0ff" strokeWidth="1.5" />
            <circle cx="20" cy="20" r="3" fill="#00f0ff" />
            <line x1="20" y1="2" x2="20" y2="8" stroke="#00f0ff" strokeWidth="1.5" />
            <line x1="20" y1="32" x2="20" y2="38" stroke="#00f0ff" strokeWidth="1.5" />
            <line x1="2" y1="20" x2="8" y2="20" stroke="#00f0ff" strokeWidth="1.5" />
            <line x1="32" y1="20" x2="38" y2="20" stroke="#00f0ff" strokeWidth="1.5" />
          </svg>
          <div>
            <h1 className="font-display text-lg font-black leading-none tracking-[3px] text-cyan [text-shadow:0_0_12px_rgba(0,240,255,0.5)]">
              NEXUS SCAN
            </h1>
            <span className="font-mono text-[10px] uppercase tracking-[4px] text-text-dim">
              acesso restrito
            </span>
          </div>
        </div>

        {!ativo ? (
          <p className="border border-amber/30 bg-amber/5 p-3 font-mono text-[11px] leading-relaxed text-amber">
            Autenticação não configurada — defina NEXT_PUBLIC_SUPABASE_URL e
            NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente. Ver GUIA-ATIVACAO-AUTH.md
          </p>
        ) : (
          <div className="border border-grid bg-panel/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex gap-1.5">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setModo(m);
                    setErro("");
                  }}
                  className={`flex-1 rounded-sm border px-2 py-2 font-mono text-[10px] uppercase tracking-[2px] transition-colors ${
                    modo === m
                      ? "border-cyan bg-cyan/10 text-cyan"
                      : "border-grid bg-void-2 text-text-dim hover:border-cyan-dim hover:text-cyan"
                  }`}
                >
                  {m === "login" ? "Autenticar" : "Criar acesso"}
                </button>
              ))}
            </div>

            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[2px] text-text-dim">
              Identificação (e-mail)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@exemplo.com"
              className={inputCls}
              autoComplete="email"
            />
            <label className="mb-1.5 mt-3 block font-mono text-[9px] uppercase tracking-[2px] text-text-dim">
              Código de acesso (senha)
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && autenticar()}
              placeholder="mínimo 6 caracteres"
              className={inputCls}
              autoComplete={modo === "login" ? "current-password" : "new-password"}
            />

            {erro && (
              <p className="mt-3 font-mono text-[10px] leading-relaxed text-danger">
                ✕ {erro}
              </p>
            )}
            {aviso && (
              <p className="mt-3 font-mono text-[10px] leading-relaxed text-lime">
                ✓ {aviso}
              </p>
            )}

            <button
              onClick={autenticar}
              disabled={carregando || !email || senha.length < 6}
              className="mt-5 w-full border border-cyan bg-gradient-to-br from-cyan/10 to-magenta/10 p-3.5 font-display text-sm font-bold uppercase tracking-[3px] text-cyan transition-all [text-shadow:0_0_8px_rgba(0,240,255,0.6)] hover:from-cyan/25 hover:to-magenta/15 hover:shadow-[0_0_24px_rgba(0,240,255,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {carregando
                ? "PROCESSANDO..."
                : modo === "login"
                  ? "◈ ENTRAR NO GRID"
                  : "◈ CRIAR OPERADOR"}
            </button>
          </div>
        )}

        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[3px] text-text-dim">
          engenheiro.ai · recon grid
        </p>
      </div>
    </main>
  );
}
