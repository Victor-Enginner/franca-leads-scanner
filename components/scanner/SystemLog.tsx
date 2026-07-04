"use client";

export type LogLine = {
  id: number;
  t: string;
  txt: string;
  cls?: "ok" | "warn";
};

export default function SystemLog({ lines }: { lines: LogLine[] }) {
  return (
    <div className="max-h-[110px] overflow-hidden font-mono text-[10px] leading-relaxed text-lime">
      {lines.map((ln) => (
        <div key={ln.id} className="animate-fade-ln opacity-0">
          <span className="text-text-dim">[{ln.t}]</span> {ln.txt}{" "}
          {ln.cls === "ok" && <span className="text-lime">OK</span>}
          {ln.cls === "warn" && <span className="text-amber">!</span>}
        </div>
      ))}
    </div>
  );
}
