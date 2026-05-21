import { useEffect, useRef, useState } from "react";

const API_BASE = "https://v3.football.api-sports.io";
const LEAGUE_ID = 1;
const SEASON = 2026;
const CACHE_KEY = "wc2026_live_scores";
const TOURNAMENT_START = new Date("2026-06-11T15:00:00-06:00");
const TOURNAMENT_END = new Date("2026-07-19T23:59:59-04:00");

export interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string; elapsed?: number | null }; venue?: { name?: string } };
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
    const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY as string | undefined;
    if (!apiKey) {
      setState(s => ({ ...s, loading: false, error: "no-api-key" }));
      return;
    }

    let cancelled = false;

    async function fetchOnce(): Promise<void> {
      const phase = currentPhase();
      if (phase === "post") return;

      const now = Date.now();
      if (now - lastFetchRef.current < 30_000) return;
      const h = new Date().getHours();
      if (h >= 2 && h < 8) return;

      let url: string;
      if (phase === "pre") {
        url = `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&next=5`;
      } else {
        url = `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&live=all`;
      }

      try {
        const res = await fetch(url, { headers: { "x-apisports-key": apiKey! } });
        if (res.status === 429) {
          intervalMs.current = Math.min(intervalMs.current * 2, 24 * 60 * 60 * 1000);
          schedule();
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        let fixtures: ApiFixture[] = json.response ?? [];

        if (phase === "live" && fixtures.length === 0) {
          const today = new Date().toISOString().slice(0, 10);
          const r2 = await fetch(
            `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&date=${today}`,
            { headers: { "x-apisports-key": apiKey! } },
          );
          if (r2.ok) {
            const j2 = await r2.json();
            fixtures = j2.response ?? [];
          }
        }

        if (cancelled) return;
        lastFetchRef.current = Date.now();
        writeCache(fixtures);
        setState({ fixtures, phase, loading: false, error: null, lastFetch: Date.now() });

        const hasLive = fixtures.some(f => ["1H","2H","HT","ET","P","LIVE"].includes(f.fixture.status.short));
        if (phase === "pre") {
          intervalMs.current = 0;
        } else if (hasLive) {
          intervalMs.current = 10 * 60 * 1000;
        } else if (fixtures.length > 0) {
          intervalMs.current = 60 * 60 * 1000;
        } else {
          intervalMs.current = 0;
        }
        schedule();
      } catch (err) {
        if (cancelled) return;
        setState(s => ({ ...s, loading: false, error: (err as Error).message }));
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
