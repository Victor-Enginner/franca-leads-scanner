"use client";

// Overlay do palco do globo: retículo, legenda de fase, hint de espera,
// botão de pular e toggle de som. Puramente presentacional — o estado
// vem do ScannerDashboard.
export default function ScanSequence({
  phase,
  phaseSub,
  reticleShow,
  rtName,
  rtStatus,
  idleVisible,
  skipVisible,
  soundOn,
  onToggleSound,
  onSkip,
}: {
  phase: string;
  phaseSub: string;
  reticleShow: boolean;
  rtName: string;
  rtStatus: string;
  idleVisible: boolean;
  skipVisible: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-[4] font-mono text-[9px] tracking-wide text-cyan-dim">
        ◤ ORBITAL VIEW
      </div>
      <div className="pointer-events-none absolute right-4 top-12 z-[4] font-mono text-[9px] tracking-wide text-cyan-dim">
        SAT·LINK 04 · V6 ◥
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-[4] font-mono text-[9px] tracking-wide text-cyan-dim">
        ◈ ARRASTE P/ GIRAR · CTRL+SCROLL P/ ZOOM
      </div>

      <button
        onClick={onToggleSound}
        className={`absolute right-4 top-4 z-[7] rounded-sm border px-3 py-1.5 font-mono text-[9px] tracking-wide transition-colors ${
          soundOn
            ? "border-cyan-dim bg-panel/60 text-lime"
            : "border-grid bg-panel/60 text-text-dim hover:border-cyan-dim hover:text-cyan"
        }`}
      >
        ♪ SOM: {soundOn ? "ON" : "OFF"}
      </button>

      <button
        onClick={onSkip}
        className={`absolute bottom-4 right-4 z-[7] rounded-sm border border-cyan-dim bg-panel/80 px-4 py-2 font-mono text-[10px] uppercase tracking-[2px] text-cyan transition-opacity hover:bg-cyan/15 ${
          skipVisible ? "opacity-70 hover:opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        ▶▶ PULAR [ESC]
      </button>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div
          className={`absolute h-[340px] w-[340px] transition-opacity duration-500 ${
            reticleShow ? "opacity-55" : "opacity-0"
          }`}
        >
          <svg viewBox="0 0 340 340" fill="none" className="h-full w-full">
            <g className="origin-center animate-spin-slow">
              <circle
                cx="170"
                cy="170"
                r="160"
                stroke="#00f0ff"
                strokeWidth="0.5"
                opacity="0.3"
                strokeDasharray="4 8"
              />
              <circle
                cx="170"
                cy="170"
                r="130"
                stroke="#00f0ff"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </g>
            <g className="origin-center animate-spin-rev">
              <circle
                cx="170"
                cy="170"
                r="100"
                stroke="#ff2e97"
                strokeWidth="0.5"
                opacity="0.4"
                strokeDasharray="2 6"
              />
            </g>
            <line x1="170" y1="10" x2="170" y2="50" stroke="#00f0ff" strokeWidth="1" />
            <line x1="170" y1="290" x2="170" y2="330" stroke="#00f0ff" strokeWidth="1" />
            <line x1="10" y1="170" x2="50" y2="170" stroke="#00f0ff" strokeWidth="1" />
            <line x1="290" y1="170" x2="330" y2="170" stroke="#00f0ff" strokeWidth="1" />
            <circle cx="170" cy="170" r="6" stroke="#ff2e97" strokeWidth="1.5" />
          </svg>
          <div className="absolute left-1/2 top-1/2 w-[180px] -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="min-h-[15px] font-body text-xs font-semibold text-cyan [text-shadow:0_0_8px_rgba(0,240,255,0.8)]">
              {rtName}
            </div>
            <div className="mt-0.5 font-mono text-[8px] tracking-[2px] text-text-dim">
              {rtStatus}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 z-[6] -translate-x-1/2 -translate-y-1/2 text-center transition-opacity duration-500 ${
          idleVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="font-display text-[15px] uppercase tracking-[5px] text-text-dim">
          GRID EM ESPERA
        </div>
        <div className="mt-2.5 font-mono text-[10px] tracking-[2px] text-cyan-dim">
          ▶ inicie a varredura para mapear o setor
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-1/2 z-[5] -translate-x-1/2 text-center">
        <div className="min-h-[18px] font-display text-[13px] uppercase tracking-[4px] text-cyan [text-shadow:0_0_12px_rgba(0,240,255,0.6)]">
          {phase}
        </div>
        <div className="mt-1.5 min-h-[14px] font-mono text-[10px] tracking-[2px] text-text-dim">
          {phaseSub}
        </div>
      </div>
    </>
  );
}
