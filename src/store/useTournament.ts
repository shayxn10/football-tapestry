// Central tournament state hook with localStorage persistence.
import { useState, useCallback, useMemo } from "react";
import {
  TournamentEngine,
  type TournamentState,
  type MatchResult,
  type ResolvedMatch,
  type GroupTable,
  THIRD_PLACE_SLOT_GROUPS,
} from "@/engine/tournamentEngine";
import { ALL_FIXTURES, CHRONOLOGICAL_IDS } from "@/data/wc2026Fixtures";

export type SimMode = "full" | "journey";

// ── T3 slot safety patch ──────────────────────────────────────
// Some bracket configurations leave a T3_ slot null when no top-8
// third-place team is in its eligible group set. We patch by ranking
// ALL 12 third-place teams via FIFA tiebreakers and assigning the best
// remaining unassigned team into each null T3 slot.
function patchMissingT3Slots(
  bracket: Record<string, string | null>,
  groups: Record<string, GroupTable>,
): Record<string, string | null> {
  const patched = { ...bracket };
  const nullT3Slots = Object.keys(THIRD_PLACE_SLOT_GROUPS).filter(
    k => !patched[k],
  );
  if (nullT3Slots.length === 0) return patched;

  const allThirds = Object.entries(groups)
    .map(([g, table]) => {
      const third = table[2];
      if (!third) return null;
      return {
        team: third.team,
        group: g,
        points: third.points,
        goalDifference: third.goalDifference,
        goalsFor: third.goalsFor,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  allThirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const assigned = new Set(
    Object.entries(patched)
      .filter(([k, v]) => k.startsWith("T3_") && v)
      .map(([, v]) => v as string),
  );
  const unassigned = allThirds.filter(t => !assigned.has(t.team));

  for (const slot of nullT3Slots) {
    const pick = unassigned.shift();
    if (pick) {
      patched[slot] = pick.team;
      console.log(`[patchMissingT3Slots] filled ${slot} → ${pick.team} (Group ${pick.group})`);
    } else {
      console.warn(`[patchMissingT3Slots] no candidate for ${slot}`);
    }
  }
  return patched;
}

function reresolveMatches(
  resolved: Record<string, ResolvedMatch>,
  bracket: Record<string, string | null>,
): Record<string, ResolvedMatch> {
  const out: Record<string, ResolvedMatch> = {};
  for (const [id, m] of Object.entries(resolved)) {
    const t1raw = m.team1;
    const t2raw = m.team2;
    const t1 = /^(W_|R_|T3_|L_)/.test(t1raw) ? bracket[t1raw] ?? t1raw : t1raw;
    const t2 = /^(W_|R_|T3_|L_)/.test(t2raw) ? bracket[t2raw] ?? t2raw : t2raw;
    const isReady =
      !!t1 && !!t2 &&
      !/^(W_|R_|T3_|L_)/.test(t1) &&
      !/^(W_|R_|T3_|L_)/.test(t2);
    out[id] = { ...m, team1: t1, team2: t2, isReady };
  }
  return out;
}

const KEYS = {
  results: "wc2026_engine_results",
  mode: "wc2026_mode",
  team: "wc2026_team",
  index: "wc2026_index",
};

// Module-level engine: single source of truth across the app.
export const engine = new TournamentEngine(ALL_FIXTURES);

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
