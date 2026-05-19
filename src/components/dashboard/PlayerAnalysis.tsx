import { useMemo, useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { ChartCard } from "./ChartCard";
import { Flag } from "./Flag";
import { players2022, type Player2022, flag } from "@/data/wcData";

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" };
const grid = { stroke: "var(--border)", strokeDasharray: "3 3", opacity: 0.4 };

function PTT({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: Player2022 & { delta?: number; per90?: number } = payload[0].payload;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <Flag code={d.code} size={16} />
        <span className="font-bold">{d.name}</span>
        <span className="text-muted-foreground">· {d.position}</span>
      </div>
      <div className="font-mono text-muted-foreground space-y-0.5">
        <div>Goals: <span className="text-pitch">{d.goals}</span> · xG: <span className="text-cyan">{d.xG}</span></div>
        <div>Assists: {d.assists} · xA: {d.xA}</div>
        <div>Minutes: {d.minutes}</div>
        {d.delta !== undefined && <div>Finishing Δ: <span className="text-accent">{d.delta.toFixed(2)}</span></div>}
        {d.per90 !== undefined && <div>Goals/90: <span className="text-pitch">{d.per90.toFixed(2)}</span></div>}
      </div>
    </div>
  );
}

export function PlayerAnalysis() {
  const [compareIds, setCompareIds] = useState<string[]>(["Lionel Messi", "Kylian Mbappé"]);

  const withDelta = useMemo(
    () => players2022.map(p => ({ ...p, delta: +(p.goals - p.xG).toFixed(2) })),
    []
  );
  const overperformers = [...withDelta].sort((a, b) => b.delta - a.delta).slice(0, 7);
  const underperformers = [...withDelta].sort((a, b) => a.delta - b.delta).slice(0, 7);
  const per90 = useMemo(
    () =>
      players2022
        .filter(p => p.minutes > 300)
        .map(p => ({ ...p, per90: +(p.goals / (p.minutes / 90)).toFixed(2) }))
        .sort((a, b) => b.per90 - a.per90)
        .slice(0, 10),
    []
  );

  const maxAxis = Math.max(...players2022.map(p => Math.max(p.xG, p.goals))) + 1;

  function togglePlayer(name: string) {
    setCompareIds(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 3 ? [...prev, name] : prev
    );
  }

  const compareData = useMemo(() => {
    const selected = players2022.filter(p => compareIds.includes(p.name));
    return ["goals", "assists", "xG", "xA"].map(metric => {
      const row: any = { metric };
      selected.forEach(p => (row[p.name] = (p as any)[metric]));
      return row;
    });
  }, [compareIds]);

  const compareColors = ["var(--pitch)", "var(--magenta)", "var(--cyan)"];

  return (
    <div className="space-y-5">
      {/* xG vs Goals scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="xG vs Goals" subtitle="player-level · Qatar 2022 · diagonal = perfect finishing" accent="pitch">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
              <CartesianGrid {...grid} />
              <XAxis type="number" dataKey="xG" domain={[0, maxAxis]} {...axis}
                label={{ value: "xG (expected goals)", position: "insideBottom", offset: -10, fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis type="number" dataKey="goals" domain={[0, maxAxis]} {...axis}
                label={{ value: "Goals", angle: -90, position: "insideLeft", fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Tooltip content={<PTT />} cursor={{ strokeDasharray: "3 3" }} />
              <ReferenceLine
                segment={[{ x: 0, y: 0 }, { x: maxAxis, y: maxAxis }]}
                stroke="var(--muted-foreground)" strokeDasharray="4 4"
              />
              <Scatter
                data={withDelta}
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  const over = payload.delta >= 0;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={13}
                        fill={over ? "var(--pitch)" : "var(--magenta)"} fillOpacity={0.18} />
                      <image href={flag(payload.code)} x={cx - 10} y={cy - 7} width={20} height={14} preserveAspectRatio="xMidYMid slice" />
                    </g>
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Goals per 90 minutes" subtitle="filter: minutes > 300 · top 10" accent="cyan">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={per90} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid {...grid} horizontal={false} />
              <XAxis type="number" {...axis} />
              <YAxis type="category" dataKey="name" {...axis} width={130} tick={{ fontSize: 10 }} />
              <Tooltip content={<PTT />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
              <Bar dataKey="per90" fill="var(--cyan)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Finishing Delta leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Finishing Delta — Overperformers" subtitle="Goals − xG · top positive (descriptive, small samples)" accent="pitch">
          <DeltaList items={overperformers} positive />
        </ChartCard>
        <ChartCard title="Finishing Delta — Underperformers" subtitle="Goals − xG · top negative" accent="magenta">
          <DeltaList items={underperformers} positive={false} />
        </ChartCard>
      </div>

      {/* Comparison tool */}
      <ChartCard title="Player Comparison Tool" subtitle="select up to 3 players to compare key metrics" accent="amber">
        <div className="flex flex-wrap gap-2 mb-4">
          {players2022.slice(0, 18).map(p => {
            const active = compareIds.includes(p.name);
            return (
              <button key={p.name} onClick={() => togglePlayer(p.name)}
                className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md border transition-all ${
                  active ? "border-accent bg-accent/15 text-foreground" : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}>
                <Flag code={p.code} size={12} />
                {p.name}
              </button>
            );
          })}
        </div>
        {compareIds.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8 font-mono">Select players above to compare</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={compareData}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="metric" {...axis} />
                <YAxis {...axis} />
                <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
                {compareIds.map((name, i) => (
                  <Bar key={name} dataKey={name} fill={compareColors[i]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {compareIds.map((name, i) => {
                const p = players2022.find(x => x.name === name)!;
                const per = (p.goals / (p.minutes / 90)) || 0;
                return (
                  <div key={name} className="rounded-lg border border-border/60 bg-muted/20 p-3"
                    style={{ borderLeft: `3px solid ${compareColors[i]}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Flag code={p.code} size={16} />
                      <span className="font-bold text-sm">{p.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-muted-foreground">
                      <div>Min: <span className="text-foreground">{p.minutes}</span></div>
                      <div>Goals: <span className="text-foreground">{p.goals}</span></div>
                      <div>xG: <span className="text-foreground">{p.xG}</span></div>
                      <div>xA: <span className="text-foreground">{p.xA}</span></div>
                      <div>Ast: <span className="text-foreground">{p.assists}</span></div>
                      <div>G/90: <span className="text-foreground">{per.toFixed(2)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </ChartCard>
    </div>
  );
}

function DeltaList({ items, positive }: { items: (Player2022 & { delta: number })[]; positive: boolean }) {
  const max = Math.max(...items.map(i => Math.abs(i.delta)));
  return (
    <div className="space-y-2">
      {items.map((p, i) => {
        const pct = (Math.abs(p.delta) / max) * 100;
        return (
          <motion.div key={p.name}
            initial={{ opacity: 0, x: positive ? -10 : 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3">
            <Flag code={p.code} size={18} />
            <span className="text-xs font-semibold w-32 truncate">{p.name}</span>
            <div className="flex-1 h-5 bg-muted/40 rounded-md overflow-hidden">
              <div
                className="h-full rounded-md"
                style={{
                  width: `${pct}%`,
                  background: positive ? "var(--pitch)" : "var(--magenta)",
                }}
              />
            </div>
            <span className="text-xs font-mono w-14 text-right tabular-nums"
              style={{ color: positive ? "var(--pitch)" : "var(--magenta)" }}>
              {positive ? "+" : ""}{p.delta.toFixed(2)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
