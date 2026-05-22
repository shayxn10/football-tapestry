import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeamFlag } from "./TeamFlag";
import { MATCH_META } from "@/data/wc2026Fixtures";
import type { ResolvedMatch } from "@/engine/tournamentEngine";
import { engine } from "@/store/useTournament";
import { resolveTeamName } from "@/utils/resolveTeamName";

interface Props {
  match: ResolvedMatch;
  onSimulate: (goals1: number, goals2: number, winnerId?: string) => void;
  onPrev: () => void;
  canGoPrev: boolean;
  totalIndex: number;
  totalCount: number;
}

export function MatchSimulatorCard({ match, onSimulate, onPrev, canGoPrev, totalIndex, totalCount }: Props) {
  const meta = MATCH_META[match.id];
  const isKO = match.stage !== "group";
  const bracket = engine.getState().bracket;
  const team1 = resolveTeamName(match.team1, bracket);
  const team2 = resolveTeamName(match.team2, bracket);
  const [g1, setG1] = useState(match.result?.goals1 ?? 0);
  const [g2, setG2] = useState(match.result?.goals2 ?? 0);
  const [winner, setWinner] = useState<string | undefined>(match.result?.winnerId);

  useEffect(() => {
    setG1(match.result?.goals1 ?? 0);
    setG2(match.result?.goals2 ?? 0);
    setWinner(match.result?.winnerId);
  }, [match.id]);

  const isDrawKO = isKO && g1 === g2;
  const canSubmit = !isDrawKO || !!winner;

  const dateLabel = meta
    ? new Date(meta.date + "T00:00:00Z").toLocaleDateString(undefined, {
        weekday: "short", month: "short", day: "numeric",
      })
    : "";

  function step(side: 1 | 2, dir: 1 | -1) {
    if (side === 1) setG1(v => Math.max(0, Math.min(20, v + dir)));
    else setG2(v => Math.max(0, Math.min(20, v + dir)));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header strip */}
          <div className="bg-gradient-to-r from-accent/15 via-transparent to-pitch/15 px-5 py-3 border-b border-border/60 flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest">
            <span className="text-accent font-bold">{meta?.stageLabel}</span>
            <span className="text-muted-foreground">Match {meta?.matchNumber} · {totalIndex + 1}/{totalCount}</span>
          </div>

          {/* Date / venue */}
          <div className="px-5 sm:px-7 pt-5 text-center text-[11px] font-mono text-muted-foreground">
            {dateLabel} · {meta?.kickoff} · {meta?.venue}
          </div>

          {/* Teams + score steppers */}
          <div className="px-4 sm:px-7 py-6 sm:py-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
              {/* Team 1 */}
              <div className="flex flex-col items-center gap-3">
                <TeamFlag name={match.team1} size={64} />
                <p className="text-sm sm:text-base font-bold uppercase tracking-tight text-center leading-tight">
                  {match.team1}
                </p>
                <ScoreStepper value={g1} onChange={d => step(1, d)} />
              </div>

              <div className="text-3xl sm:text-4xl font-black text-muted-foreground/60">vs</div>

              {/* Team 2 */}
              <div className="flex flex-col items-center gap-3">
                <TeamFlag name={match.team2} size={64} />
                <p className="text-sm sm:text-base font-bold uppercase tracking-tight text-center leading-tight">
                  {match.team2}
                </p>
                <ScoreStepper value={g2} onChange={d => step(2, d)} />
              </div>
            </div>

            {/* KO draw winner picker */}
            {isDrawKO && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-3 rounded-lg border border-amber/40 bg-amber/5"
              >
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber text-center mb-2.5">
                  Penalty shootout — pick the winner
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[match.team1, match.team2].map(t => (
                    <button
                      key={t}
                      onClick={() => setWinner(t)}
                      className={`min-h-[48px] px-3 py-2 rounded-md text-xs font-bold uppercase transition ${
                        winner === t
                          ? "bg-amber text-background"
                          : "bg-muted/40 hover:bg-muted text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Simulate button */}
            <button
              onClick={() => onSimulate(g1, g2, winner)}
              disabled={!canSubmit}
              className="mt-6 w-full min-h-[52px] bg-accent text-accent-foreground rounded-lg font-bold uppercase tracking-widest text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {match.isComplete ? "Update result" : "Simulate"}
            </button>

            {/* Nav */}
            <div className="mt-4 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <button
                onClick={onPrev}
                disabled={!canGoPrev}
                className="px-3 py-2 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ◀ Previous
              </button>
              <span>{match.isComplete ? "✓ Recorded" : "Awaiting result"}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ScoreStepper({ value, onChange }: { value: number; onChange: (delta: 1 | -1) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(-1)}
        className="w-11 h-11 rounded-md bg-muted/50 hover:bg-muted text-xl font-black text-foreground transition"
        aria-label="decrease"
      >
        −
      </button>
      <div className="w-14 h-11 flex items-center justify-center bg-background border border-border rounded-md text-3xl font-black tabular-nums font-mono">
        {value}
      </div>
      <button
        onClick={() => onChange(1)}
        className="w-11 h-11 rounded-md bg-accent/20 hover:bg-accent/30 text-xl font-black text-accent transition"
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}
