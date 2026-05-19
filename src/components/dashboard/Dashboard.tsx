import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ScatterChart, Scatter, Legend, ReferenceLine, Cell,
} from "recharts";
import { motion } from "framer-motion";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Flag } from "@/components/dashboard/Flag";
import { Insights } from "@/components/dashboard/Insights";
import { TopScorers } from "@/components/dashboard/TopScorers";
import { PlayerAnalysis } from "@/components/dashboard/PlayerAnalysis";
import {
  goalsByMinute, goalsByInterval, stageGoals, topTeams,
  teamTimeBuckets, teams2022, flag,
} from "@/data/wcData";
import fifaLogo from "@/assets/fifa-wc-logo.png";

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" };
const grid = { stroke: "var(--border)", strokeDasharray: "3 3", opacity: 0.4 };

function TT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs shadow-xl">
      {label !== undefined && <p className="font-mono text-muted-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="font-medium">{p.name}:</span>
          <span className="font-mono text-pitch">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ScatterTT({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <Flag code={d.code} size={18} />
        <span className="font-bold">{d.team}</span>
      </div>
      <div className="font-mono text-muted-foreground space-y-0.5">
        <div>Possession: <span className="text-pitch">{d.possession}%</span></div>
        <div>Shots: <span className="text-pitch">{d.shots}</span></div>
        <div>Passes: <span className="text-pitch">{d.passes}</span></div>
        <div>Goals: <span className="text-pitch">{d.goals}</span></div>
        <div>Conceded: <span className="text-magenta">{d.conceded}</span></div>
      </div>
    </div>
  );
}

const PHASES = ["all", "group", "knockout"] as const;
type Phase = typeof PHASES[number];

export function Dashboard() {
  const [phase, setPhase] = useState<Phase>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedMatch, setSelectedMatch] = useState<string>("all");

  const filteredStage = useMemo(() => {
    if (phase === "all") return stageGoals;
    if (phase === "group") return stageGoals.filter(s => s.stage === "Group Stage");
    return stageGoals.filter(s => s.stage !== "Group Stage");
  }, [phase]);

  const filteredTeams2022 = useMemo(() => {
    if (selectedTeam === "all") return teams2022;
    return teams2022.filter(t => t.code === selectedTeam);
  }, [selectedTeam]);

  const totalHistGoals = topTeams.reduce((s, t) => s + t.goals, 0);
  const goals2022 = teams2022.reduce((s, t) => s + t.goals, 0);

  return (
    <div className="min-h-screen text-foreground">
      {/* HEADER */}
      <header className="border-b border-border/60 backdrop-blur-xl sticky top-0 z-50 bg-background/85">
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--accent) 0%, var(--accent) 33%, var(--foreground) 33%, var(--foreground) 66%, var(--pitch) 66%, var(--pitch) 100%)" }} />
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={fifaLogo} alt="FIFA World Cup" className="h-11 w-11 rounded-md object-cover ring-1 ring-border/60" />
            <div className="leading-tight">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">FIFA · Official Data</p>
              <h1 className="text-base sm:text-lg font-black tracking-tight uppercase">World Cup Analytics</h1>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-0 text-[11px] font-bold uppercase tracking-wider">
            {[
              { l: "Historical", i: 0 },
              { l: "Top Scorers", i: 1 },
              { l: "Tactical 2022", i: 2 },
              { l: "Players 2022", i: 3 },
              { l: "Insights", i: 4 },
            ].map((t) => (
              <a key={t.l} href={`#section-${t.i}`} className="px-3 py-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-accent transition-colors">
                {t.l}
              </a>
            ))}
          </nav>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-pitch animate-pulse" />
            <span className="text-muted-foreground">Live dataset</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="relative pt-2"
        >
          <div className="absolute inset-0 grid-bg opacity-20 -z-10 rounded-3xl" />
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] px-3 py-1.5 rounded-sm border border-accent/50 bg-accent/10 mb-6 text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Report · 22 Tournaments · 964 Matches · 2,720 Goals
              </div>
              <h2 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[0.92] tracking-tighter uppercase">
                Where, when<br />
                & <span className="text-accent">how goals</span><br />
                happen.
              </h2>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Nine decades of FIFA World Cup scoring decoded — combining historical goal
                patterns with deep tactical analysis from Qatar 2022. Possession isn't king.
                Shots are.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#section-0" className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider bg-foreground text-background rounded-sm hover:bg-foreground/90 transition-colors">
                  Explore the data
                </a>
                <a href="#section-1" className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider border border-border hover:border-foreground text-foreground rounded-sm transition-colors">
                  Top scorers ↓
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-accent/10 blur-3xl -z-10 rounded-full" />
              <img src={fifaLogo} alt="FIFA World Cup 2026" className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl ring-1 ring-border/60" />
              <div className="grid grid-cols-2 gap-2 mt-4 max-w-sm mx-auto">
                {[
                  { l: "Historical goals", v: "2,720", c: "foreground" },
                  { l: "Qatar 2022 goals", v: goals2022.toString(), c: "accent" },
                  { l: "Tournaments", v: "22", c: "foreground" },
                  { l: "Teams tracked", v: "79", c: "accent" },
                ].map((s) => (
                  <div key={s.l} className="bg-card/60 border border-border/60 rounded-md p-3">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{s.l}</p>
                    <p className="stat-number text-2xl mt-1 tabular-nums" style={{ color: `var(--${s.c})` }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* FILTERS */}
        <section className="glass-card rounded-2xl p-4 sm:p-5 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span>◆</span> Filters
          </div>
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1">
            {PHASES.map(p => (
              <button key={p} onClick={() => setPhase(p)}
                className={`px-3 py-1.5 text-xs font-mono uppercase rounded-md transition-all ${
                  phase === p ? "bg-pitch text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {p}
              </button>
            ))}
          </div>
          <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}
            className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-pitch">
            <option value="all">ALL TEAMS</option>
            {teams2022.map(t => <option key={t.code} value={t.code}>{t.team.toUpperCase()}</option>)}
          </select>
          <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)}
            className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-pitch">
            <option value="all">ALL MATCHES</option>
            <option value="final">FINAL — ARG v FRA</option>
            <option value="sf1">SF — ARG v CRO</option>
            <option value="sf2">SF — FRA v MAR</option>
          </select>
          {selectedTeam !== "all" && (
            <div className="ml-auto flex items-center gap-2 text-xs">
              <Flag code={selectedTeam} size={18} />
              <span className="font-bold">{teams2022.find(t => t.code === selectedTeam)?.team}</span>
            </div>
          )}
        </section>

        {/* SECTION 1: HISTORICAL */}
        <section id="section-0" className="space-y-5 scroll-mt-24">
          <SectionHeader index="01" label="Historical Analysis" title="Goals across nine decades" badge="1930 – 2022" badgeAccent="cyan" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ChartCard title="Goal distribution by match minute" subtitle="1930 — 2022 · all matches" accent="pitch" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={goalsByMinute}>
                  <defs>
                    <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--cyan)" />
                      <stop offset="100%" stopColor="var(--pitch)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="minute" {...axis} tickFormatter={(v) => `${v}'`} />
                  <YAxis {...axis} />
                  <Tooltip content={<TT />} cursor={{ stroke: "var(--pitch)", strokeOpacity: 0.3 }} />
                  <ReferenceLine x={45} stroke="var(--muted-foreground)" strokeDasharray="2 2" label={{ value: "HT", fill: "var(--muted-foreground)", fontSize: 10 }} />
                  <ReferenceLine x={90} stroke="var(--magenta)" strokeDasharray="2 2" label={{ value: "FT", fill: "var(--magenta)", fontSize: 10 }} />
                  <Line type="monotone" dataKey="goals" stroke="url(#lg1)" strokeWidth={2.5} dot={false} name="Goals" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Goals by 15-min intervals" subtitle="frequency buckets" accent="magenta">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={goalsByInterval}>
                  <CartesianGrid {...grid} vertical={false} />
                  <XAxis dataKey="bucket" {...axis} />
                  <YAxis {...axis} />
                  <Tooltip content={<TT />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                  <Bar dataKey="goals" radius={[6, 6, 0, 0]}>
                    {goalsByInterval.map((b, i) => (
                      <Cell key={i} fill={b.bucket === "76-90" || b.bucket === "90+" ? "var(--magenta)" : "var(--pitch)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Group vs Knockout goals" subtitle="goals per match by phase" accent="cyan">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={filteredStage} layout="vertical">
                  <CartesianGrid {...grid} horizontal={false} />
                  <XAxis type="number" {...axis} />
                  <YAxis type="category" dataKey="stage" {...axis} width={110} />
                  <Tooltip content={<TT />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                  <Bar dataKey="avg" name="Avg goals/match" fill="var(--cyan)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top 10 teams by total goals" subtitle="all-time WC scoring leaders" accent="pitch" className="lg:col-span-2">
              <div className="space-y-2.5">
                {topTeams.map((t, i) => {
                  const pct = (t.goals / topTeams[0].goals) * 100;
                  return (
                    <motion.div key={t.team}
                      initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 group">
                      <span className="stat-number text-xs text-muted-foreground w-6">{String(i + 1).padStart(2, "0")}</span>
                      <Flag code={t.code} size={24} />
                      <span className="text-sm font-semibold w-28 truncate">{t.team}</span>
                      <div className="flex-1 h-7 bg-muted/40 rounded-md overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: i * 0.04, ease: "easeOut" }}
                          className="h-full rounded-md flex items-center justify-end px-2"
                          style={{ background: `linear-gradient(90deg, color-mix(in oklab, var(--pitch) 30%, transparent), var(--pitch))` }}>
                          <span className="stat-number text-xs font-bold text-primary-foreground">{t.goals}</span>
                        </motion.div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-16 text-right">{t.tournaments} eds</span>
                    </motion.div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Team goal distribution across time buckets" subtitle="stacked — when each nation tends to score" accent="amber">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={teamTimeBuckets}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="team" {...axis} angle={-25} textAnchor="end" height={70} />
                <YAxis {...axis} />
                <Tooltip content={<TT />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
                {(["1-15", "16-30", "31-45", "46-60", "61-75", "76-90", "90+"] as const).map((k, i) => {
                  const colors = ["var(--cyan)", "var(--chart-2)", "var(--pitch)", "var(--lime)", "var(--amber)", "var(--magenta)", "var(--accent)"];
                  return <Bar key={k} dataKey={k} stackId="a" fill={colors[i]} />;
                })}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* SECTION 2: TOP SCORERS */}
        <section id="section-1" className="space-y-5 scroll-mt-24 pt-4 border-t border-border/40">
          <SectionHeader index="02" label="Top Scorers" title="The all-time leaderboard" badge="1930 – 2022" badgeAccent="cyan" />
          <TopScorers />
        </section>

        {/* SECTION 3: TACTICAL 2022 */}
        <section id="section-2" className="space-y-5 scroll-mt-24 pt-4 border-t border-border/40">
          <SectionHeader index="03" label="Tactical Team Analysis" title="What correlates with goals?" badge="Qatar 2022 only" badgeAccent="accent" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ScatterCard title="Possession vs Goals" subtitle="weak-to-moderate correlation observed · r ≈ 0.31" accent="magenta"
              xKey="possession" xLabel="Possession (%)" yKey="goals" yLabel="Goals scored" data={filteredTeams2022} />
            <ScatterCard title="Shots vs Goals" subtitle="strongest correlation observed · r ≈ 0.74" accent="pitch"
              xKey="shots" xLabel="Total shots" yKey="goals" yLabel="Goals scored" data={filteredTeams2022} />
            <ScatterCard title="Passes vs Goals" subtitle="moderate correlation observed · r ≈ 0.48" accent="cyan"
              xKey="passes" xLabel="Total passes" yKey="goals" yLabel="Goals scored" data={filteredTeams2022} />
            <ScatterCard title="Defensive pressure vs Goals conceded" subtitle="weak negative correlation observed · r ≈ −0.22" accent="amber"
              xKey="pressure" xLabel="Defensive actions" yKey="conceded" yLabel="Goals conceded" data={filteredTeams2022} />
          </div>

          <ChartCard title="2022 Match Outcome Comparison" subtitle="goals scored vs goals conceded per team — not a ranking of team strength" accent="pitch">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={[...teams2022].sort((a, b) => b.goals - a.goals).slice(0, 16)}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="team" {...axis} angle={-30} textAnchor="end" height={80} interval={0} />
                <YAxis {...axis} />
                <Tooltip content={<TT />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
                <Bar dataKey="goals" name="Scored" fill="var(--pitch)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conceded" name="Conceded" fill="var(--magenta)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-muted-foreground mt-3 font-mono">
              Note: comparative trend based on data — totals reflect tournament progression (more matches in knockout rounds), not absolute team quality.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[...teams2022].sort((a, b) => b.goals - a.goals).slice(0, 16).map(t => (
                <div key={t.code} className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md bg-muted/40">
                  <Flag code={t.code} size={14} />
                  <span>{t.team}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </section>

        {/* SECTION 4: PLAYERS 2022 */}
        <section id="section-3" className="space-y-5 scroll-mt-24 pt-4 border-t border-border/40">
          <SectionHeader index="04" label="⚽ Player Performance Analysis" title="Who finished, who didn't" badge="Qatar 2022 only" badgeAccent="accent" />
          <PlayerAnalysis />
        </section>

        {/* SECTION 5: INSIGHTS */}
        <section id="section-4" className="scroll-mt-24 pt-4 border-t border-border/40">
          <Insights />
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border/60 pt-8 pb-12 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <div>FIFA WORLD CUP ANALYTICS · BUILT WITH REACT + RECHARTS</div>
          <div className="flex gap-4">
            <span>DATA: FIFA · STATSBOMB</span>
            <span className="text-pitch">● LIVE</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SectionHeader({ index, label, title, badge, badgeAccent = "pitch" }: { index: string; label: string; title: string; badge?: string; badgeAccent?: "pitch" | "accent" | "cyan" | "magenta" }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-pitch">{index} — {label}</p>
          {badge && (
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm border"
              style={{
                color: `var(--${badgeAccent})`,
                borderColor: `color-mix(in oklab, var(--${badgeAccent}) 50%, transparent)`,
                background: `color-mix(in oklab, var(--${badgeAccent}) 12%, transparent)`,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="h-px flex-1 max-w-md bg-gradient-to-r from-border to-transparent hidden sm:block" />
    </div>
  );
}

interface ScatterCardProps {
  title: string; subtitle: string; accent: "pitch" | "magenta" | "cyan" | "amber";
  xKey: keyof typeof teams2022[0]; xLabel: string; yKey: keyof typeof teams2022[0]; yLabel: string;
  data: typeof teams2022;
}
function ScatterCard({ title, subtitle, accent, xKey, xLabel, yKey, yLabel, data }: ScatterCardProps) {
  return (
    <ChartCard title={title} subtitle={subtitle} accent={accent}>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
          <CartesianGrid {...grid} />
          <XAxis type="number" dataKey={xKey as string} name={xLabel} {...axis}
            label={{ value: xLabel, position: "insideBottom", offset: -10, fill: "var(--muted-foreground)", fontSize: 11 }} />
          <YAxis type="number" dataKey={yKey as string} name={yLabel} {...axis}
            label={{ value: yLabel, angle: -90, position: "insideLeft", fill: "var(--muted-foreground)", fontSize: 11 }} />
          <Tooltip content={<ScatterTT />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill={`var(--${accent})`}
            shape={(props: any) => {
              const { cx, cy, payload } = props;
              return (
                <g>
                  <circle cx={cx} cy={cy} r={14} fill={`var(--${accent})`} fillOpacity={0.15} />
                  <image href={flag(payload.code)} x={cx - 10} y={cy - 7} width={20} height={14} preserveAspectRatio="xMidYMid slice" />
                </g>
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
