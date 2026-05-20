// Central tournament state hook with localStorage persistence.
import { useState, useCallback, useMemo } from "react";
import {
  TournamentEngine,
  type TournamentState,
  type MatchResult,
  type ResolvedMatch,
} from "@/engine/tournamentEngine";
import { ALL_FIXTURES, CHRONOLOGICAL_IDS } from "@/data/wc2026Fixtures";

export type SimMode = "full" | "journey";

const KEYS = {
  results: "wc2026_engine_results",
  mode: "wc2026_mode",
  team: "wc2026_team",
  index: "wc2026_index",
};

// Module-level engine: single source of truth across the app.
const engine = new TournamentEngine(ALL_FIXTURES);

// Restore persisted results on first import (client only)
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(KEYS.results);
    if (saved) {
      const results = JSON.parse(saved) as Record<string, MatchResult>;
      for (const [id, r] of Object.entries(results)) {
        try { engine.setMatchResult(id, r); } catch { /* ignore stale */ }
      }
    }
  } catch { /* ignore */ }
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return JSON.parse(v) as T;
  } catch { return fallback; }
}

export function useTournament() {
  const [state, setState] = useState<TournamentState>(engine.getState());
  const [mode, setModeState] = useState<SimMode | null>(() => readLS<SimMode | null>(KEYS.mode, null));
  const [selectedTeam, setSelectedTeamState] = useState<string | null>(() => readLS<string | null>(KEYS.team, null));
  const [currentIndex, setCurrentIndexState] = useState<number>(() => readLS<number>(KEYS.index, 0));

  const sync = useCallback(() => {
    const next = engine.getState();
    setState(next);
    try { localStorage.setItem(KEYS.results, JSON.stringify(next.results)); } catch {}
  }, []);

  const setMatchResult = useCallback((id: string, r: MatchResult) => {
    engine.setMatchResult(id, r);
    sync();
  }, [sync]);

  const clearMatchResult = useCallback((id: string) => {
    engine.clearMatchResult(id);
    sync();
  }, [sync]);

  const reset = useCallback(() => {
    engine.reset();
    try {
      localStorage.removeItem(KEYS.results);
      localStorage.removeItem(KEYS.mode);
      localStorage.removeItem(KEYS.team);
      localStorage.removeItem(KEYS.index);
    } catch {}
    setModeState(null);
    setSelectedTeamState(null);
    setCurrentIndexState(0);
    sync();
  }, [sync]);

  const setMode = useCallback((m: SimMode | null) => {
    setModeState(m);
    try {
      if (m === null) localStorage.removeItem(KEYS.mode);
      else localStorage.setItem(KEYS.mode, JSON.stringify(m));
    } catch {}
  }, []);

  const setSelectedTeam = useCallback((t: string | null) => {
    setSelectedTeamState(t);
    try {
      if (t === null) localStorage.removeItem(KEYS.team);
      else localStorage.setItem(KEYS.team, JSON.stringify(t));
    } catch {}
  }, []);

  const setCurrentIndex = useCallback((i: number) => {
    setCurrentIndexState(i);
    try { localStorage.setItem(KEYS.index, JSON.stringify(i)); } catch {}
  }, []);

  // ── Derived selectors ──────────────────────────────────────
  const chronologicalMatches: ResolvedMatch[] = useMemo(
    () => CHRONOLOGICAL_IDS.map(id => state.resolvedMatches[id]).filter(Boolean) as ResolvedMatch[],
    [state.resolvedMatches]
  );

  const groupMatches = chronologicalMatches.filter(m => m.stage === "group");
  const groupMatchesCompleted = groupMatches.filter(m => m.isComplete).length;
  const groupMatchesTotal = groupMatches.length;
  const isGroupStageComplete =
    Object.keys(state.groups).length === 12 &&
    groupMatches.every(m => m.isComplete);

  const champion = state.bracket["W_F_M01"] ?? null;

  return {
    state,
    chronologicalMatches,
    setMatchResult,
    clearMatchResult,
    reset,
    mode,
    setMode,
    selectedTeam,
    setSelectedTeam,
    currentIndex,
    setCurrentIndex,
    isGroupStageComplete,
    groupMatchesCompleted,
    groupMatchesTotal,
    champion,
  };
}
