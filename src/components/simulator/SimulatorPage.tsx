import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useTournament, engine } from "@/store/useTournament";
import { ModeSelect } from "@/components/simulator/ModeSelect";
import { TeamPicker } from "@/components/simulator/TeamPicker";
import { MatchSimulatorCard } from "@/components/simulator/MatchSimulatorCard";
import { KnockoutView } from "@/components/simulator/KnockoutView";
import { StandingsDrawer } from "@/components/simulator/StandingsDrawer";
import { ChampionReveal } from "@/components/simulator/ChampionReveal";
import { autoSimulate } from "@/utils/autoSimulate";
import { CHRONOLOGICAL_IDS } from "@/data/wc2026Fixtures";
import fifaLogo from "@/assets/fifa-wc-logo.png";

export function SimulatorPage() {
  const t = useTournament();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showChampion, setShowChampion] = useState(false);

  // Mode selection flow
  const [pickingTeam, setPickingTeam] = useState(false);

  // Decide if a (fresh-engine) match needs user input
  const requiresUserInput = useCallback(
    (m: { team1: string; team2: string }) => {
      if (t.mode === "full") return true;
      return m.team1 === t.selectedTeam || m.team2 === t.selectedTeam;
    },
    [t.mode, t.selectedTeam],
  );

  // Auto-advance: always read fresh engine state. Hard-stop on isReady=false.
  const advance = useCallback(() => {
    if (!t.mode) return;
    let safety = 250;
    let stoppedAt: string | null = null;
    while (safety-- > 0) {
      const fresh = engine.getState();
      const ordered = CHRONOLOGICAL_IDS
        .map(id => fresh.resolvedMatches[id])
        .filter((m): m is NonNullable<typeof m> => Boolean(m));
      let didMutate = false;
      for (const m of ordered) {
        if (m.isComplete) continue;
        if (!m.isReady) { stoppedAt = m.id; break; }
        if (requiresUserInput(m)) { stoppedAt = m.id; break; }
        // Auto-simulate this ready match.
        const r = autoSimulate();
        let winnerId: string | undefined;
        if (m.stage !== "group" && r.goals1 === r.goals2) {
          winnerId = Math.random() < 0.5 ? m.team1 : m.team2;
        }
        try {
          t.setMatchResult(m.id, { ...r, winnerId });
          didMutate = true;
          break; // re-read fresh state
        } catch { /* slot not ready — abort */ }
      }
      if (!didMutate) break;
    }
    if (stoppedAt) {
      const idx = CHRONOLOGICAL_IDS.indexOf(stoppedAt);
      if (idx >= 0 && idx !== t.currentIndex) t.setCurrentIndex(idx);
    }
  }, [t.mode, t.currentIndex, t.setMatchResult, t.setCurrentIndex, requiresUserInput]);

  useEffect(() => { advance(); }, [advance, t.state]);



  // Watch for champion crowned
  useEffect(() => {
    if (t.champion && !showChampion) setShowChampion(true);
  }, [t.champion]);

  const currentMatch = t.chronologicalMatches[t.currentIndex] ?? null;

  function handleSimulate(g1: number, g2: number, winnerId?: string) {
    if (!currentMatch) return;
    t.setMatchResult(currentMatch.id, { goals1: g1, goals2: g2, winnerId });
    t.setCurrentIndex(t.currentIndex + 1);
  }

  function handlePrev() {
    // find previous completed match the user simulated
    for (let i = t.currentIndex - 1; i >= 0; i--) {
      const m = t.chronologicalMatches[i];
      if (!m) continue;
      if (t.mode === "journey" && m.team1 !== t.selectedTeam && m.team2 !== t.selectedTeam) continue;
      t.setCurrentIndex(i);
      return;
    }
  }

  function handleReset() {
    if (!confirm("Reset the entire tournament? All results will be cleared.")) return;
    t.reset();
    setShowChampion(false);
    setPickingTeam(false);
  }

  // ── Render flow ──
  let body: React.ReactNode;

  if (!t.mode) {
    body = pickingTeam ? (
      <TeamPicker
        onBack={() => setPickingTeam(false)}
        onConfirm={(team) => {
          t.setSelectedTeam(team);
          t.setMode("journey");
          t.setCurrentIndex(0);
        }}
      />
    ) : (
      <ModeSelect
        onSelect={(m) => {
          if (m === "journey") setPickingTeam(true);
          else { t.setMode("full"); t.setCurrentIndex(0); }
        }}
      />
    );
  } else if (t.champion) {
    body = (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ChampionBanner champion={t.champion} runnerUp={t.state.bracket["L_F_M01"]} />
        <KnockoutView state={t.state} onPickWinner={(id, w) => t.setMatchResult(id, { goals1: 1, goals2: 1, winnerId: w })} highlightTeam={t.selectedTeam} />
      </div>
    );
  } else if (t.isGroupStageComplete) {
    body = (
      <KnockoutView
        state={t.state}
        highlightTeam={t.selectedTeam}
        onPickWinner={(id, winner) => {
          // Default 1-1 winner-on-pens unless current match in feed
          if (currentMatch?.id === id) return;
          t.setMatchResult(id, { goals1: 1, goals2: 1, winnerId: winner });
        }}
      />
    );
    // But if there's a current KO match needing input, override with match card
    if (currentMatch && currentMatch.stage !== "group" && currentMatch.isReady && !currentMatch.isComplete) {
      body = (
        <MatchSimulatorCard
          match={currentMatch}
          onSimulate={handleSimulate}
          onPrev={handlePrev}
          canGoPrev={t.currentIndex > 0}
          totalIndex={t.currentIndex}
          totalCount={CHRONOLOGICAL_IDS.length}
        />
      );
    }
  } else if (currentMatch) {
    body = (
      <MatchSimulatorCard
        match={currentMatch}
        onSimulate={handleSimulate}
        onPrev={handlePrev}
        canGoPrev={t.currentIndex > 0}
        totalIndex={t.currentIndex}
        totalCount={CHRONOLOGICAL_IDS.length}
      />
    );
  } else {
    body = <div className="p-12 text-center text-muted-foreground">Loading next match…</div>;
  }

  return (
    <div className="min-h-screen text-foreground">
      {/* Top navbar */}
      <header className="border-b border-border/60 backdrop-blur-xl sticky top-0 z-40 bg-background/85">
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--accent) 0%, var(--accent) 33%, var(--foreground) 33%, var(--foreground) 66%, var(--pitch) 66%, var(--pitch) 100%)" }} />
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={fifaLogo} alt="FIFA" className="h-10 w-10 rounded-md object-cover ring-1 ring-border/60" />
            <div className="leading-tight">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">FIFA · Simulator</p>
              <h1 className="text-base sm:text-lg font-black tracking-tight uppercase">World Cup 2026</h1>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
            <Link to="/" className="px-3 py-2 text-muted-foreground hover:text-foreground transition">Dashboard</Link>
            <span className="px-3 py-2 text-accent border-b-2 border-accent">⚽ Simulator</span>
          </nav>
          <button onClick={handleReset} className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-magenta transition">
            ↻ Reset
          </button>
        </div>
      </header>

      {/* Sub-header with progress */}
      {t.mode && (
        <div className="border-b border-border/40 bg-background/60">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest">
              <span className="text-muted-foreground">Mode</span>
              <span className="text-accent font-bold">{t.mode === "full" ? "Full Tournament" : `Journey · ${t.selectedTeam}`}</span>
            </div>
            <div className="flex-1 max-w-md min-w-[160px]">
              <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest mb-1">
                <span className="text-muted-foreground">Group stage</span>
                <span className="text-foreground tabular-nums">{t.groupMatchesCompleted} / {t.groupMatchesTotal}</span>
              </div>
              <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-pitch"
                  initial={{ width: 0 }}
                  animate={{ width: `${(t.groupMatchesCompleted / Math.max(1, t.groupMatchesTotal)) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-3 py-2 min-h-[40px] text-[10px] font-mono uppercase tracking-widest bg-card border border-border rounded-md hover:border-accent transition"
            >
              📊 Standings
            </button>
          </div>
        </div>
      )}

      <main>{body}</main>

      <StandingsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        state={t.state}
        highlightTeam={t.selectedTeam}
      />

      <AnimatePresence>
        {showChampion && t.champion && (
          <ChampionReveal
            champion={t.champion}
            isUserTeam={t.mode === "journey" && t.selectedTeam === t.champion}
            onDismiss={() => setShowChampion(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

function ChampionBanner({ champion, runnerUp }: { champion: string; runnerUp: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-5 sm:p-6 rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/15 via-accent/5 to-pitch/15"
    >
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent mb-2">Tournament Champion</p>
      <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">🏆 {champion}</h2>
      {runnerUp && <p className="text-muted-foreground text-sm mt-1">Runner-up: {runnerUp}</p>}
    </motion.div>
  );
}
