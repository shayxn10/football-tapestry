import { useEffect, useRef, useState } from "react";

// Calls our own server-side proxy (football-data.org blocks browser CORS).
const BASE = "/api/public/wc-matches";
const CACHE_KEY = "wc2026_live_scores_v2";
const TOURNAMENT_START = new Date("2026-06-11T15:00:00-06:00");
const TOURNAMENT_END = new Date("2026-07-19T23:59:59-04:00");

// Kept the same shape the UI already consumes so components don't have to change.
export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed?: number | null };
    venue?: { name?: string };
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  league?: { round?: string };
}

export type Phase = "pre" | "live" | "post";

export function currentPhase(now = new Date()): Phase {
  if (now < TOURNAMENT_START) return "pre";
  if (now > TOURNAMENT_END) return "post";
  return "live";
}

interface FDMatch {
  id: number;
  utcDate: string;
  status: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "POSTPONED" | "SUSPENDED" | "CANCELED";
  matchday?: number;
  stage?: string;
  group?: string | null;
  homeTeam: { id: number; name: string; shortName?: string; crest?: string };
  awayTeam: { id: number; name: string; shortName?: string; crest?: string };
  score: { fullTime: { home: number | null; away: number | null } };
  venue?: string;
}

function mapStatus(s: FDMatch["status"]): string {
  switch (s) {
    case "IN_PLAY": return "2H";
    case "PAUSED": return "HT";
    case "FINISHED": return "FT";
    case "SCHEDULED":
    case "TIMED": return "NS";
    default: return s;
  }
}

function mapMatch(m: FDMatch): ApiFixture {
  return {
    fixture: {
      id: m.id,
      date: m.utcDate,
      status: { short: mapStatus(m.status) },
      venue: m.venue ? { name: m.venue } : undefined,
    },
    teams: {
      home: { id: m.homeTeam.id, name: m.homeTeam.shortName || m.homeTeam.name, logo: m.homeTeam.crest || "" },
      away: { id: m.awayTeam.id, name: m.awayTeam.shortName || m.awayTeam.name, logo: m.awayTeam.crest || "" },
    },
    goals: { home: m.score?.fullTime?.home ?? null, away: m.score?.fullTime?.away ?? null },
    league: { round: m.group || m.stage || (m.matchday ? `Matchday ${m.matchday}` : undefined) },
  };
}

interface State {
  fixtures: ApiFixture[];
  phase: Phase;
  loading: boolean;
  error: string | null;
  lastFetch: number;
}

function readCache(): { fixtures: ApiFixture[]; ts: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function writeCache(fixtures: ApiFixture[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fixtures, ts: Date.now() }));
  } catch { /* ignore */ }
}

export function useLiveScores() {
  const cached = typeof window !== "undefined" ? readCache() : null;
  const [state, setState] = useState<State>({
    fixtures: cached?.fixtures ?? [],
    phase: currentPhase(),
    loading: !cached,
    error: null,
    lastFetch: cached?.ts ?? 0,
  });
  const intervalMs = useRef<number>(60 * 60 * 1000);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchRef = useRef<number>(cached?.ts ?? 0);

  useEffect(() => {
    let cancelled = false;

    async function fetchMatches(params: string): Promise<FDMatch[]> {
      const res = await fetch(`${BASE}${params}`);
      if (res.status === 429) {
        const err = new Error("rate-limit");
        (err as Error & { code?: number }).code = 429;
        throw err;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data.matches as FDMatch[]) ?? [];
    }

    async function fetchOnce(): Promise<void> {
      const phase = currentPhase();
      if (phase === "post") return;

      const now = Date.now();
      // Rate-limit guard: never fetch more than once per 60s.
      if (now - lastFetchRef.current < 60_000) {
        schedule();
        return;
      }

      try {
        let matches: FDMatch[] = [];
        if (phase === "pre") {
          matches = await fetchMatches(`?status=SCHEDULED`);
          matches = matches.slice(0, 5);
        } else {
          matches = await fetchMatches(`?status=IN_PLAY`);
          if (matches.length === 0) {
            const today = new Date().toISOString().slice(0, 10);
            matches = await fetchMatches(`?dateFrom=${today}&dateTo=${today}`);
          }
        }

        if (cancelled) return;
        const fixtures = matches.map(mapMatch);
        lastFetchRef.current = Date.now();
        writeCache(fixtures);
        setState({ fixtures, phase, loading: false, error: null, lastFetch: Date.now() });

        const hasLive = fixtures.some(f => ["1H","2H","HT","ET","P","LIVE"].includes(f.fixture.status.short));
        if (phase === "pre") {
          intervalMs.current = 0; // one-shot
        } else if (hasLive) {
          intervalMs.current = 2 * 60 * 1000; // 2 min
        } else if (fixtures.length > 0) {
          intervalMs.current = 30 * 60 * 1000; // 30 min
        } else {
          intervalMs.current = 60 * 60 * 1000; // 1 hour
        }
        schedule();
      } catch (err) {
        if (cancelled) return;
        const e = err as Error & { code?: number };
        if (e.code === 429) {
          intervalMs.current = 2 * 60 * 1000;
          schedule();
          return;
        }
        setState(s => ({ ...s, loading: false, error: e.message }));
      }
    }

    function schedule() {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalMs.current <= 0) return;
      timerRef.current = setTimeout(fetchOnce, intervalMs.current);
    }

    fetchOnce();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return state;
}
