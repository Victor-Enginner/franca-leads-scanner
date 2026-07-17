"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/** true quando a viewport é >= lg (1024px). Começa false (mobile-first/SSR). */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const upd = () => setDesktop(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);
  return desktop;
}

/**
 * Largura de painel persistida no localStorage. Retorna [valor, setValor]
 * com clamp automático. O valor inicial é o default (evita mismatch de
 * hidratação); o localStorage é lido depois de montar.
 */
export function usePainelLargura(
  chave: string,
  padrao: number,
  min: number,
  max: number
): [number, (n: number) => void] {
  const [largura, setLarguraState] = useState(padrao);
  useEffect(() => {
    const salvo = Number(localStorage.getItem(chave));
    if (salvo) setLarguraState(clamp(salvo, min, max));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);
  const setLargura = useCallback(
    (n: number) => {
      const c = clamp(n, min, max);
      setLarguraState(c);
      try {
        localStorage.setItem(chave, String(c));
      } catch {
        /* modo privado */
      }
    },
    [chave, min, max]
  );
  return [largura, setLargura];
}

/**
 * Divisória arrastável entre duas colunas de um grid. Ocupa uma coluna
 * fina do grid (só no desktop — some no mobile). Ao arrastar, chama
 * onDrag com o clientX atual; quem controla o grid calcula a largura.
 */
export function ResizeHandle({
  onDrag,
  ariaLabel,
}: {
  onDrag: (clientX: number) => void;
  ariaLabel: string;
}) {
  const arrastando = useRef(false);

  useEffect(() => {
    const mover = (e: PointerEvent) => {
      if (arrastando.current) onDrag(e.clientX);
    };
    const soltar = () => {
      if (!arrastando.current) return;
      arrastando.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
    };
  }, [onDrag]);

  return (
    <div
      role="separator"
      aria-label={ariaLabel}
      aria-orientation="vertical"
      onPointerDown={(e) => {
        arrastando.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        e.preventDefault();
      }}
      className="group relative hidden cursor-col-resize lg:block"
    >
      {/* zona de clique mais larga que a linha visível */}
      <div className="absolute inset-y-0 -left-2 -right-2 z-30" />
      <div className="h-full w-px bg-grid transition-colors group-hover:bg-cyan group-hover:shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
    </div>
  );
}
