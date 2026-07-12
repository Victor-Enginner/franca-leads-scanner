"use client";

import { useEffect, useRef, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/supabase";
import Globe, { type GlobeHandle } from "./Globe";
import ScanSequence from "./ScanSequence";
import TargetFeed, { type FeedFilter } from "./TargetFeed";
import FunnelTracker from "./FunnelTracker";
import SystemLog, { type LogLine } from "./SystemLog";
import KanbanBoard from "./KanbanBoard";
import { baixarCSV, abrirRelatorio } from "./export";
import { DEMO_STORE_KEY, FRANCA, scoreColor } from "./util";

type Vista = "radar" | "funil";

const NICHOS_PADRAO =
  "salão de unhas, barbearia, hamburgueria, academia, estética facial, pet shop";

type Setor = { nome: string; lat: number; lon: number };
type JornadaResumo = {
  id: string;
  cidade: string;
  iniciada_em: string;
  expira_em: string;
  encerrada_em: string | null;
  origem: "operacao" | "legado";
  varreduras?: { id: string; encontrados: number; salvos: number; ignorados: number; estado: string }[];
};

const SETOR_PADRAO: Setor = {
  nome: "Franca, São Paulo",
  lat: FRANCA.lat,
  lon: FRANCA.lon,
};

function agora(): string {
  return new Date().toTimeString().slice(3, 8);
}

function lerStatusDemo(): Record<string, LeadStatus> {
  try {
    return JSON.parse(localStorage.getItem(DEMO_STORE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function salvarStatusDemo(id: string, status: LeadStatus) {
  try {
    const m = lerStatusDemo();
    m[id] = status;
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(m));
  } catch {
    // sem localStorage (ex: modo privado) — estado vive só na sessão
  }
}

export default function ScannerDashboard({
  leadsIniciais,
  demo = false,
  usuarioEmail = null,
  iaAtiva = false,
  erroInicial = null,
}: {
  leadsIniciais: Lead[];
  demo?: boolean;
  usuarioEmail?: string | null;
  iaAtiva?: boolean;
  erroInicial?: string | null;
}) {
  const ordenados = [...leadsIniciais].sort(
    (a, b) => b.score_oportunidade - a.score_oportunidade
  );

  const [leads, setLeads] = useState<Lead[]>(ordenados);
  const [feedIds, setFeedIds] = useState<string[]>(ordenados.map((l) => l.id));
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [scanning, setScanning] = useState(false);
  const [phase, setPhase] = useState("");
  const [phaseSub, setPhaseSub] = useState("");
  const [reticleShow, setReticleShow] = useState(false);
  const [rtName, setRtName] = useState("");
  const [rtStatus, setRtStatus] = useState("");
  const [idleVisible, setIdleVisible] = useState(true);
  const [skipVisible, setSkipVisible] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sysStatus, setSysStatus] = useState("SISTEMA ONLINE");
  const [toast, setToast] = useState("");
  const [nichosTexto, setNichosTexto] = useState(NICHOS_PADRAO);
  const [cidadeTexto, setCidadeTexto] = useState("Franca, SP");
  const [setor, setSetor] = useState<Setor>(SETOR_PADRAO);
  const [vista, setVista] = useState<Vista>("radar");
  const [quota, setQuota] = useState<{
    plano: string;
    varreduras_limite: number;
    varreduras_usadas: number;
  } | null>(null);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [historico, setHistorico] = useState<JornadaResumo[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([
    { id: 1, t: "00:00", txt: "núcleo iniciado", cls: "ok" },
    { id: 2, t: "00:01", txt: "uplink orbital", cls: "ok" },
    { id: 3, t: "00:02", txt: "aguardando comando" },
  ]);

  const globeRef = useRef<GlobeHandle>(null);
  const leadsRef = useRef(leads);
  const scanningRef = useRef(false);
  const skipRef = useRef(false);
  const hasScannedRef = useRef(false);
  const soundOnRef = useRef(false);
  const actxRef = useRef<AudioContext | null>(null);
  const logIdRef = useRef(4);
  const toastTmRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  leadsRef.current = leads;
  soundOnRef.current = soundOn;

  // Modo demo: recupera os status salvos no navegador.
  useEffect(() => {
    if (!demo) return;
    const salvos = lerStatusDemo();
    if (Object.keys(salvos).length === 0) return;
    setLeads((atual) =>
      atual.map((l) => (salvos[l.id] ? { ...l, status: salvos[l.id] } : l))
    );
  }, [demo]);

  // Plota os leads já conhecidos no globo assim que ele monta.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    for (const l of leadsRef.current) {
      if (l.lat != null && l.lon != null) {
        globe.addPoint(l.lat, l.lon, scoreColor(l.score_oportunidade));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Esc pula a animação.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && scanningRef.current) skipRef.current = true;
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Cota do plano (só no modo multiusuário).
  const carregarQuota = () => {
    if (demo || !usuarioEmail) return;
    fetch("/api/perfil")
      .then((r) => r.json())
      .then((d) => d.perfil && setQuota(d.perfil))
      .catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(carregarQuota, []);

  async function sair() {
    try {
      const { getSupabaseBrowser, authAtivoNoCliente } = await import(
        "@/lib/supabase-browser"
      );
      if (authAtivoNoCliente()) {
        await getSupabaseBrowser().auth.signOut();
      }
    } finally {
      window.location.href = "/login";
    }
  }

  // O Chrome pode restaurar a página congelada da memória (back/forward
  // cache) com câmera, estado E código de versões antigas. Nesse caso,
  // recarrega pra garantir estado limpo e bundle atual.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  function beep(freq: number, dur = 0.08, vol = 0.05) {
    if (!soundOnRef.current || !actxRef.current) return;
    const actx = actxRef.current;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(actx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur);
  }

  function toggleSound() {
    setSoundOn((v) => {
      const next = !v;
      if (next && !actxRef.current && typeof window !== "undefined") {
        actxRef.current = new AudioContext();
      }
      return next;
    });
  }

  function termLog(txt: string, cls?: "ok" | "warn") {
    setLogs((prev) => {
      const next = [...prev, { id: logIdRef.current++, t: agora(), txt, cls }];
      return next.slice(-7);
    });
  }

  function showToast(msg: string) {
    setToast(msg);
    if (toastTmRef.current) clearTimeout(toastTmRef.current);
    toastTmRef.current = setTimeout(() => setToast(""), 1800);
  }

  async function abrirHistorico() {
    setHistoricoAberto(true);
    setCarregandoHistorico(true);
    try {
      const resposta = await fetch("/api/jornadas");
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.error ?? "Falha ao carregar histórico");
      setHistorico(dados.jornadas ?? []);
    } catch {
      showToast("FALHA AO CARREGAR HISTÓRICO");
    } finally {
      setCarregandoHistorico(false);
    }
  }

  async function abrirJornada(id: string) {
    try {
      const resposta = await fetch(`/api/leads?jornada=${encodeURIComponent(id)}`);
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.error ?? "Falha ao carregar jornada");
      const jornadaLeads = (dados.leads ?? []) as Lead[];
      const ordenadosJornada = [...jornadaLeads].sort(
        (a, b) => b.score_oportunidade - a.score_oportunidade
      );
      setLeads(ordenadosJornada);
      setFeedIds(ordenadosJornada.map((lead) => lead.id));
      setHistoricoAberto(false);
      showToast(`${ordenadosJornada.length} LEADS DA JORNADA CARREGADOS`);
    } catch {
      showToast("FALHA AO ABRIR JORNADA");
    }
  }

  function setPhase2(t: string, s = "") {
    setPhase(t);
    setPhaseSub(s);
  }

  function skippableWait(ms: number) {
    return new Promise<void>((res) => {
      if (skipRef.current) return res();
      let done = false;
      const to = setTimeout(() => {
        done = true;
        clearInterval(iv);
        res();
      }, ms);
      const iv = setInterval(() => {
        if (skipRef.current && !done) {
          done = true;
          clearTimeout(to);
          clearInterval(iv);
          res();
        }
      }, 30);
    });
  }

  // Varredura real: POST /api/scan e depois recarrega a lista completa.
  async function runRealScan(): Promise<Lead[]> {
    const nichos = nichosTexto
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    const resp = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nichos, cidade: cidadeTexto.trim() }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error ?? "Falha na varredura");
    const leadsResp = await fetch("/api/leads");
    const leadsData = await leadsResp.json();
    return leadsData.leads ?? [];
  }

  async function startScan() {
    if (scanningRef.current) return;
    scanningRef.current = true;
    skipRef.current = false;
    setScanning(true);
    setSysStatus("VARREDURA ATIVA");
    setIdleVisible(false);
    setSkipVisible(true);
    setProgress(0);
    setFeedIds([]);

    const globe = globeRef.current;
    globe?.clearPoints();
    const fast = hasScannedRef.current;
    const mult = fast ? 0.35 : 1;

    // Resolve as coordenadas da cidade em paralelo com a fase inicial.
    // No modo demo não há Google key — fica no setor padrão (Franca).
    const geocodePromise: Promise<Setor> = demo
      ? Promise.resolve(SETOR_PADRAO)
      : fetch(`/api/geocode?cidade=${encodeURIComponent(cidadeTexto.trim())}`)
          .then(async (r) => {
            const d = await r.json();
            if (!r.ok) throw new Error(d.error ?? "cidade não encontrada");
            return d as Setor;
          });
    geocodePromise.catch(() => {}); // tratado no await abaixo

    setPhase2("AQUISIÇÃO ORBITAL", "estabilizando uplink de satélite...");
    termLog("varredura iniciada", "ok");
    termLog(demo ? "modo demo · varredura simulada" : "bloqueio orbital → uplink");
    globe?.setAutoRotate(true);
    globe?.setTargetZoom(1);
    beep(320, 0.1);
    await skippableWait(1400 * mult);

    let alvoSetor: Setor;
    try {
      alvoSetor = await geocodePromise;
      setSetor(alvoSetor);
    } catch (e) {
      // Cidade inválida: encerra a varredura sem disparar nada no Google.
      termLog("setor não localizado", "warn");
      termLog(String(e instanceof Error ? e.message : e).slice(0, 40));
      showToast("CIDADE NÃO ENCONTRADA — VERIFIQUE O SETOR");
      setPhase2("", "");
      setSysStatus("SISTEMA ONLINE");
      setSkipVisible(false);
      setIdleVisible(true);
      scanningRef.current = false;
      setScanning(false);
      return;
    }

    // Só agora dispara a varredura real, com a cidade validada.
    const scanPromise = demo ? null : runRealScan();
    if (scanPromise) scanPromise.catch(() => {}); // evita unhandled rejection; tratado abaixo

    setPhase2(
      "TRIANGULANDO SETOR",
      `localizando ${alvoSetor.nome} · ${alvoSetor.lat.toFixed(2)}, ${alvoSetor.lon.toFixed(2)}`
    );
    termLog("rotação p/ coordenada alvo", "ok");
    globe?.setAutoRotate(false);
    await globe?.spinTo(alvoSetor.lat, alvoSetor.lon, fast, () => skipRef.current);
    // Sem zoom automático: a vista orbital inteira fica melhor com a
    // textura realista (aproximar demais só mostra pixel de oceano).
    setReticleShow(true);
    beep(420, 0.1);
    await skippableWait(1400 * mult);

    setPhase2("IMPLANTANDO MALHA", "projetando grade de reconhecimento 12×12");
    termLog("malha de recon implantada", "ok");
    await skippableWait(1000 * mult);

    let scanLeads = leadsRef.current;
    if (scanPromise) {
      setPhase2("SINCRONIZANDO", "recebendo dados do Google Places...");
      try {
        scanLeads = await scanPromise;
        setLeads(scanLeads);
        termLog(`${scanLeads.length} registros recebidos`, "ok");
      } catch (e) {
        termLog("falha na varredura real", "warn");
        termLog(String(e instanceof Error ? e.message : e).slice(0, 40));
        showToast("FALHA NA VARREDURA — VER LOG");
        // Continua com os leads já conhecidos pra não deixar a tela vazia.
        scanLeads = leadsRef.current;
      }
    }

    setPhase2("ESCANEANDO ALVOS", "identificando negócios no setor...");
    const sorted = [...scanLeads].sort((a, b) => a.nicho.localeCompare(b.nicho));
    for (let i = 0; i < sorted.length; i++) {
      const lead = sorted[i];
      if (lead.lat != null && lead.lon != null) {
        globe?.addPoint(lead.lat, lead.lon, scoreColor(lead.score_oportunidade));
      }
      setRtName(lead.nome);
      setRtStatus("ANALISANDO...");
      setProgress(((i + 1) / sorted.length) * 100);
      setFeedIds((prev) => [lead.id, ...prev]);
      beep(600 + lead.score_oportunidade * 4, 0.05, 0.04);
      if (i % 3 === 0) termLog(`alvo :: ${lead.nome.substring(0, 16)}`);
      await skippableWait(fast ? 90 : 320);
    }
    setRtName("");
    setRtStatus("");

    const hot = sorted.filter((l) => l.score_oportunidade >= 50).length;
    setPhase2(
      "VARREDURA COMPLETA",
      `${sorted.length} alvos · ${hot} de alta prioridade`
    );
    termLog("varredura finalizada", "ok");
    termLog(`${hot} alvos quentes priorizados`, "warn");
    setSysStatus("ANÁLISE PRONTA");
    setSkipVisible(false);
    beep(520, 0.15, 0.06);
    setTimeout(() => beep(700, 0.2, 0.06), 120);
    scanningRef.current = false;
    setScanning(false);
    hasScannedRef.current = true;
    carregarQuota();
  }

  // Muda status: PATCH no backend real; localStorage no modo demo.
  async function mudarStatus(lead: Lead, status: LeadStatus) {
    const atualizacaoContato =
      status === "contatado" || status === "respondeu"
        ? new Date().toISOString()
        : undefined;
    setLeads((atual) =>
      atual.map((l) =>
        l.id === lead.id
          ? { ...l, status, ...(atualizacaoContato ? { ultimo_contato_em: atualizacaoContato } : {}) }
          : l
      )
    );
    if (demo) {
      salvarStatusDemo(lead.id, status);
      return;
    }
    try {
      const resp = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!resp.ok) throw new Error();
    } catch {
      setLeads((atual) =>
        atual.map((l) => (l.id === lead.id ? lead : l))
      );
      showToast("ERRO AO SALVAR STATUS");
    }
  }

  // Salva anotação do lead (kanban). Demo → só em memória.
  async function handleNotasChange(lead: Lead, notas: string) {
    setLeads((atual) =>
      atual.map((l) => (l.id === lead.id ? { ...l, notas } : l))
    );
    showToast("NOTA SALVA ✓");
    if (demo) return;
    try {
      const resp = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notas }),
      });
      if (!resp.ok) throw new Error();
    } catch {
      showToast("ERRO AO SALVAR NOTA");
    }
  }

  function handleCopy(lead: Lead) {
    navigator.clipboard
      .writeText(lead.mensagem_sugerida)
      .then(() => showToast("MENSAGEM COPIADA ✓"))
      .catch(() => showToast("FALHA AO COPIAR"));
    beep(660, 0.06);
  }

  function handleWhatsApp(lead: Lead) {
    if (lead.status === "não contatado") mudarStatus(lead, "contatado");
    showToast("ABRINDO WHATSAPP →");
  }

  // Gera nova mensagem via IA e atualiza o card em memória.
  async function handleGerarIA(lead: Lead) {
    try {
      const resp = await fetch(`/api/leads/${lead.id}/mensagem`, {
        method: "POST",
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? "falha na IA");
      setLeads((atual) =>
        atual.map((l) =>
          l.id === lead.id ? { ...l, mensagem_sugerida: data.mensagem } : l
        )
      );
      showToast("MENSAGEM GERADA POR IA ✦");
      beep(680, 0.08);
    } catch (e) {
      showToast("FALHA NA IA — VER CONSOLE");
      console.error("gerarIA:", e);
    }
  }

  function handleToggleDone(lead: Lead) {
    const fechado = lead.status === "fechado";
    mudarStatus(lead, fechado ? "não contatado" : "fechado");
    showToast(fechado ? "LEAD REABERTO" : "LEAD MARCADO COMO FECHADO ✓");
    beep(fechado ? 400 : 720, 0.08);
  }

  const feedLeads = feedIds
    .map((id) => leads.find((l) => l.id === id))
    .filter((l): l is Lead => Boolean(l));
  const quentes = feedLeads.filter((l) => l.score_oportunidade >= 50).length;
  const setorLabel = setor.nome.split(",")[0].trim().toUpperCase() || "—";

  return (
    <main className="min-h-screen">
      {erroInicial && (
        <div role="alert" className="border-b border-amber bg-amber/10 px-5 py-2 text-center font-mono text-[10px] tracking-[2px] text-amber">
          {erroInicial}
        </div>
      )}
      {/* HUD superior */}
      <div className="relative z-10 flex items-center justify-between border-b border-grid bg-gradient-to-b from-panel/90 to-panel/30 px-7 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
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
            <h1 className="font-body text-lg font-bold leading-none tracking-tight text-text-primary">
              NEXUS SCAN
            </h1>
            <span className="font-mono text-[10px] tracking-wide text-text-dim">
              Prospecção local
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden text-right sm:block">
            <div className="font-mono text-[9px] uppercase tracking-[2px] text-text-dim">Setor</div>
            <div className="max-w-[180px] truncate font-display text-base font-bold">{setorLabel}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] uppercase tracking-[2px] text-text-dim">Alvos</div>
            <div className="font-display text-base font-bold text-lime">{feedLeads.length}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] uppercase tracking-[2px] text-text-dim">Quentes</div>
            <div className="font-display text-base font-bold text-amber">{quentes}</div>
          </div>
          <div className="flex overflow-hidden rounded-sm border border-grid">
            {(["radar", "funil"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-[2px] transition-colors ${
                  vista === v
                    ? "bg-cyan/15 text-cyan"
                    : "bg-void-2 text-text-dim hover:text-cyan"
                }`}
              >
                {v === "radar" ? "Leads" : "Funil"}
              </button>
            ))}
          </div>
          <button
            onClick={abrirHistorico}
            className="hidden rounded-sm border border-grid bg-void-2 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[2px] text-text-dim transition-colors hover:border-cyan hover:text-cyan lg:block"
          >
            Histórico
          </button>
          <div className="hidden items-center gap-2 rounded-sm border border-cyan-dim bg-cyan/5 px-3.5 py-1.5 font-mono text-[11px] tracking-[2px] text-cyan lg:flex">
            <span className="h-[7px] w-[7px] animate-blink rounded-full bg-lime shadow-[0_0_8px_#7dff5c]" />
            {sysStatus}
          </div>
          {usuarioEmail && (
            <div className="hidden items-center gap-2 md:flex">
              <span
                className="max-w-[140px] truncate font-mono text-[9px] text-text-dim"
                title={usuarioEmail}
              >
                {usuarioEmail}
              </span>
              <button
                onClick={sair}
                className="rounded-sm border border-grid px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wide text-text-dim transition-colors hover:border-danger hover:text-danger"
              >
                sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Palco: rail esquerdo + área de trabalho (radar OU funil) */}
      <div className="relative grid h-auto lg:h-[calc(100vh-73px)] lg:grid-cols-[300px_1fr]">
        {/* Rail esquerdo */}
        <div className="flex flex-col gap-5 overflow-y-auto border-b border-grid bg-panel p-5 lg:border-b-0 lg:border-r">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[3px] text-cyan-dim">
              Configurar varredura
              <span className="h-px flex-1 bg-grid" />
            </div>
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[2px] text-text-dim">
              Nichos (separe por vírgula)
            </label>
            <textarea
              value={nichosTexto}
              onChange={(e) => setNichosTexto(e.target.value)}
              className="min-h-[70px] w-full resize-y rounded-sm border border-grid bg-void-2 p-2.5 font-body text-sm font-medium text-text-primary outline-none transition-shadow focus:border-cyan focus:shadow-[0_0_0_1px_#00f0ff,0_0_16px_rgba(0,240,255,0.2)]"
            />
            <label className="mb-1.5 mt-3 block font-mono text-[9px] uppercase tracking-[2px] text-text-dim">
              Cidade
            </label>
            <input
              value={cidadeTexto}
              onChange={(e) => setCidadeTexto(e.target.value)}
              placeholder="ex: Ribeirão Preto, SP"
              disabled={demo}
              title={demo ? "No modo demo o setor é fixo em Franca/SP" : undefined}
              className="w-full rounded-sm border border-grid bg-void-2 p-2.5 font-body text-sm font-medium text-text-primary outline-none transition-shadow focus:border-cyan focus:shadow-[0_0_0_1px_#00f0ff,0_0_16px_rgba(0,240,255,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[3px] text-cyan-dim">
              Resumo da cidade
              <span className="h-px flex-1 bg-grid" />
            </div>
            <div className="border border-grid bg-void-2 p-3 font-mono text-[11px] leading-loose text-text-dim">
              <div><span className="text-text-dim">Cidade</span> <span className="text-text-primary">{setor.nome}</span></div>
              <div><span className="text-text-dim">Raio de referência</span> <span className="text-text-primary">12 km</span></div>
            </div>
          </div>

          <button
            onClick={startScan}
            disabled={scanning}
            className="relative mt-1 min-h-11 w-full overflow-hidden rounded-sm bg-text-primary px-4 py-3 font-body text-sm font-semibold text-void transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {scanning && (
              <span className="absolute left-[-100%] top-0 h-full w-3/5 animate-btnsweep bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
            )}
            <span className="relative">
              {hasScannedRef.current ? "Nova varredura" : "Iniciar varredura"}
            </span>
          </button>

          {quota && (
            <div className="flex items-center justify-between border border-grid bg-void-2 px-3 py-2 font-mono text-[9px] uppercase tracking-[2px]">
              <span className="text-text-dim">Plano {quota.plano}</span>
              <span
                className={
                  quota.varreduras_usadas >= quota.varreduras_limite
                    ? "text-danger"
                    : "text-cyan"
                }
              >
                Varreduras {quota.varreduras_usadas}/{quota.varreduras_limite}
              </span>
            </div>
          )}

          {demo && (
            <p className="border border-amber/30 bg-amber/5 p-2.5 font-mono text-[10px] leading-relaxed text-amber">
              modo demo — leads reais de Franca embutidos. A varredura aqui é
              simulada; configure o .env (Supabase + Google Places) pra
              varrer e salvar de verdade. Ver README.
            </p>
          )}

          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[3px] text-cyan-dim">
              Funil comercial
              <span className="h-px flex-1 bg-grid" />
            </div>
            <FunnelTracker leads={leads} />
          </div>

        </div>

        {/* Área de trabalho: alterna entre radar (globo+feed) e funil (kanban).
            O globo NUNCA desmonta — só é escondido via CSS pra preservar o
            contexto WebGL. */}
        <div className="relative lg:min-h-0 lg:overflow-hidden">
        <div
          className={`grid h-full grid-rows-[220px_auto] lg:grid-rows-1 lg:grid-cols-[280px_1fr] ${
            vista === "funil" ? "hidden" : ""
          }`}
        >
        {/* Palco do globo */}
        <div className="relative min-h-[220px] overflow-hidden border-b border-grid bg-void-2 lg:min-h-0 lg:border-b-0 lg:border-r">
          <Globe ref={globeRef} />
          <ScanSequence
            phase={phase}
            phaseSub={phaseSub}
            reticleShow={reticleShow}
            rtName={rtName}
            rtStatus={rtStatus}
            idleVisible={idleVisible}
            skipVisible={skipVisible}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            onSkip={() => {
              if (scanningRef.current) skipRef.current = true;
            }}
          />
        </div>

        {/* Rail direito: feed de alvos. min-h-0 + overflow-hidden no lg são
            OBRIGATÓRIOS: sem eles, centenas de cards esticam a linha do
            grid (e o palco do globo junto) pra dezenas de milhares de px —
            o canvas vira uma "parede" e só uma fatia aparece na tela. */}
        <div className="bg-void lg:min-h-0 lg:overflow-hidden">
          <TargetFeed
            leads={feedLeads}
            filter={filter}
            onFilterChange={setFilter}
            progress={progress}
            onCopy={handleCopy}
            onWhatsApp={handleWhatsApp}
            onToggleDone={handleToggleDone}
            onGerarIA={handleGerarIA}
            iaAtiva={iaAtiva}
          />
        </div>
        </div>

        {/* Funil kanban (ocupa toda a área de trabalho) */}
        {vista === "funil" && (
          <div className="flex h-full min-h-[380px] flex-col">
            <div className="flex items-center gap-3 border-b border-grid px-4 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[3px] text-cyan-dim">
                ▤ Funil de vendas
              </span>
              <span className="font-mono text-[9px] tracking-wide text-text-dim">
                {leads.length} leads · arraste entre as colunas
              </span>
              <div className="ml-auto flex gap-1.5">
                <button
                  onClick={() =>
                    baixarCSV(
                      leads,
                      `nexus-${setorLabel.toLowerCase()}.csv`
                    )
                  }
                  className="rounded-sm border border-grid px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wide text-text-dim transition-colors hover:border-cyan-dim hover:text-cyan"
                >
                  ⭳ csv
                </button>
                <button
                  onClick={() => abrirRelatorio(leads, setor.nome)}
                  className="rounded-sm border border-cyan-dim bg-cyan/5 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wide text-cyan transition-colors hover:bg-cyan/15"
                >
                  ⎙ relatório / pdf
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <KanbanBoard
                leads={leads}
                onStatusChange={mudarStatus}
                onNotasChange={handleNotasChange}
                onCopy={handleCopy}
              />
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 z-[10000] -translate-x-1/2 rounded-sm border border-lime bg-panel/95 px-6 py-3 font-mono text-[11px] tracking-[2px] text-lime transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        {toast}
      </div>
      {historicoAberto && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-void/80 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-label="Histórico de jornadas" className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-sm border border-cyan-dim bg-panel p-5 shadow-[0_0_40px_rgba(0,240,255,0.12)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[3px] text-cyan">Histórico de jornadas</div>
                <div className="mt-1 font-body text-xs text-text-dim">Selecione uma jornada para revisar seus leads.</div>
              </div>
              <button onClick={() => setHistoricoAberto(false)} className="rounded-sm border border-grid px-2 py-1 font-mono text-[10px] text-text-dim hover:border-danger hover:text-danger">fechar</button>
            </div>
            {carregandoHistorico ? (
              <div className="py-8 text-center font-mono text-[10px] tracking-[2px] text-text-dim">CARREGANDO HISTÓRICO...</div>
            ) : historico.length === 0 ? (
              <div className="py-8 text-center font-mono text-[10px] tracking-[2px] text-text-dim">NENHUMA JORNADA REGISTRADA</div>
            ) : (
              <div className="space-y-2">
                {historico.map((jornada) => {
                  const total = (jornada.varreduras ?? []).reduce((soma, item) => soma + item.salvos, 0);
                  return (
                    <button key={jornada.id} onClick={() => abrirJornada(jornada.id)} className="w-full rounded-sm border border-grid bg-void-2 p-3 text-left transition-colors hover:border-cyan hover:bg-cyan/5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-body text-sm font-semibold text-text-primary">{jornada.origem === "legado" ? "Base histórica importada" : jornada.cidade}</span>
                        <span className="font-mono text-[10px] text-lime">{total} alvos</span>
                      </div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-wide text-text-dim">
                        {new Date(jornada.iniciada_em).toLocaleString("pt-BR")} · {(jornada.varreduras ?? []).length} varredura(s)
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
