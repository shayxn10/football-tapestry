import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag } from "@/components/dashboard/Flag";
import { topScorers, type Scorer } from "@/data/wcData";

type Era = "All" | "Classic" | "Modern" | "Contemporary";
type Sort = "goals" | "name" | "tournaments";

const ERAS: { key: Era; label: string; range: string }[] = [
  { key: "All", label: "All eras", range: "1930 — 2022" },
  { key: "Classic", label: "Classic", range: "1930 — 1982" },
  { key: "Modern", label: "Modern", range: "1986 — 2002" },
  { key: "Contemporary", label: "Contemporary", range: "2006 — 2022" },
];

export function TopScorers() {
  const [era, setEra] = useState<Era>("All");
  const [sort, setSort] = useState<Sort>("goals");
  const [active, setActive] = useState<string | null>("Miroslav Klose");

  const list = useMemo(() => {
    let l = era === "All" ? topScorers : topScorers.filter(s => s.era === era);
    if (sort === "goals") l = [...l].sort((a, b) => b.goals - a.goals);
    if (sort === "name") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "tournaments") l = [...l].sort((a, b) => b.tournaments.length - a.tournaments.length);
    return l;
  }, [era, sort]);

  const max = Math.max(...list.map(s => s.goals), 1);
  const activeScorer = list.find(s => s.name === active) ?? list[0];

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-1 bg-card/60 border border-border/60 rounded-md p-1">
          {ERAS.map(e => (
            <button
              key={e.key}
              onClick={() => setEra(e.key)}
              className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-sm transition-all ${
                era === e.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="bg-card/60 border border-border/60 rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="goals">Goals</option>
            <option value="name">Name (A–Z)</option>
            <option value="tournaments">Tournaments played</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Bar chart list */}
        <div className="bg-card/40 border border-border/60 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider">All-time leading scorers</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                {list.length} players · {ERAS.find(e => e.key === era)?.range}
              </p>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              Click a row →
            </div>
          </div>

          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {list.map((s, i) => {
                const pct = (s.goals / max) * 100;
                const isActive = s.name === active;
                return (
                  <motion.button
                    layout
                    key={s.name}
                    onClick={() => setActive(s.name)}
                    onMouseEnter={() => setActive(s.name)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.015 }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-left transition-colors ${
                      isActive ? "bg-foreground/5" : "hover:bg-foreground/[0.03]"
                    }`}
                  >
                    <span className="stat-number text-[11px] text-muted-foreground w-6 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Flag code={s.code} size={20} />
                    <span className="text-[13px] font-semibold w-44 truncate">{s.name}</span>
                    <div className="flex-1 h-5 bg-muted/30 rounded-sm overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-sm"
                        style={{
                          background: isActive
                            ? "var(--accent)"
                            : "color-mix(in oklab, var(--foreground) 65%, transparent)",
                        }}
                      />
                    </div>
                    <span className="stat-number text-[13px] font-bold w-7 text-right tabular-nums">
                      {s.goals}
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Profile panel */}
        <AnimatePresence mode="wait">
          {activeScorer && (
            <motion.aside
              key={activeScorer.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="bg-card/40 border border-border/60 rounded-xl p-6 h-fit lg:sticky lg:top-24"
            >
              <div className="flex items-center gap-3 mb-5">
                <Flag code={activeScorer.code} size={32} />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {activeScorer.country}
                  </p>
                  <h4 className="text-xl font-bold leading-tight">{activeScorer.name}</h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <Stat label="Goals" value={activeScorer.goals} accent />
                <Stat label="Tournaments" value={activeScorer.tournaments.length} />
                <Stat
                  label="First WC"
                  value={Math.min(...activeScorer.tournaments)}
                />
                <Stat
                  label="Last WC"
                  value={Math.max(...activeScorer.tournaments)}
                />
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Editions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeScorer.tournaments.map(t => (
                    <span
                      key={t}
                      className="text-[11px] font-mono px-2 py-1 rounded-sm border border-border/60 bg-background/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/60">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Era
                </p>
                <p className="text-sm font-semibold">{activeScorer.era}</p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="bg-background/40 border border-border/40 rounded-md p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className="stat-number text-2xl mt-1 tabular-nums"
        style={{ color: accent ? "var(--accent)" : "var(--foreground)" }}
      >
        {value}
      </p>
    </div>
  );
}

export type { Scorer };
