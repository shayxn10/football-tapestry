import { useEffect, useState } from "react";
import { useLiveScores, type ApiFixture, currentPhase } from "@/hooks/useLiveScores";
import { TEAM_CODES } from "@/utils/teamCodes";

const TOURNAMENT_START = new Date("2026-06-11T15:00:00-06:00");

function shortName(name: string): { code: string; flag: string } {
  // Try exact match, then partial
  if (TEAM_CODES[name]) return TEAM_CODES[name];
  for (const k of Object.keys(TEAM_CODES)) {
    if (name.toLowerCase().includes(k.toLowerCase())) return TEAM_CODES[k];
  }
  return { code: name.slice(0, 3).toUpperCase(), flag: "🏳️" };
}

function MatchPill({ f }: { f: ApiFixture }) {
  const home = shortName(f.teams.home.name);
  const away = shortName(f.teams.away.name);
  const status = f.fixture.status.short;
  const isLive = ["1H","2H","HT","ET","P","LIVE"].includes(status);
  const isDone = ["FT","AET","PEN"].includes(status);
  const time = new Date(f.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] sm:text-xs whitespace-nowrap"
        style={{ background: "rgba(230,57,70,0.12)", borderLeft: "2px solid #e63946" }}>
        <span className="inline-flex items-center gap-1 text-[#e63946] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e63946] animate-pulse" />LIVE
        </span>
        <span>{home.flag}</span>
        <span className="hidden sm:inline text-white font-semibold">{home.code}</span>
        <span className="font-mono text-[#f5a623] font-bold">{f.goals.home ?? 0}-{f.goals.away ?? 0}</span>
        <span className="hidden sm:inline text-white font-semibold">{away.code}</span>
        <span>{away.flag}</span>
      </span>
    );
  }
  if (isDone) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-xs whitespace-nowrap text-[#445566]">
        <span>✓</span>
        <span>{home.flag}</span>
        <span className="hidden sm:inline">{home.code}</span>
        <span className="font-mono">{f.goals.home ?? 0}-{f.goals.away ?? 0}</span>
        <span className="hidden sm:inline">{away.code}</span>
        <span>{away.flag}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-xs whitespace-nowrap text-[#8899aa]">
      <span>🕐 {time}</span>
      <span>{home.flag}</span>
      <span className="hidden sm:inline">{home.code}</span>
      <span className="text-[#445566]">vs</span>
      <span className="hidden sm:inline">{away.code}</span>
      <span>{away.flag}</span>
    </span>
  );
}

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, TOURNAMENT_START.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, total: diff };
}

export function LiveScoreBar() {
  const { fixtures, phase } = useLiveScores();
  const cd = useCountdown();

  let content: React.ReactNode;
  if (phase === "pre") {
    const txt = `⏳ World Cup begins in ${cd.days}d ${cd.hours}h ${cd.minutes}m · Opening match: Mexico vs South Africa · June 11`;
    content = (
      <span className="text-[#f5a623] text-[11px] sm:text-xs px-2 whitespace-nowrap">{txt}</span>
    );
  } else if (phase === "post") {
    content = <span className="text-[#f5a623] text-[11px] sm:text-xs px-2 whitespace-nowrap">🏆 World Cup 2026 has concluded · Thanks for following</span>;
  } else if (fixtures.length === 0) {
    content = <span className="text-[#445566] text-[11px] sm:text-xs px-2 whitespace-nowrap">No matches today</span>;
  } else {
    content = (
      <div className="flex items-center gap-3">
        {fixtures.map(f => (
          <div key={f.fixture.id} className="flex items-center gap-3">
            <MatchPill f={f} />
            <span className="text-[#1f2d45]">|</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 w-full z-[2000] flex items-stretch overflow-hidden"
      style={{
        height: "var(--ticker-h, 36px)",
        background: "#070b14",
        borderBottom: "1px solid #1f2d45",
        fontFamily: "var(--font-display)",
      }}
    >
      <div className="flex items-center px-3 sm:px-4 border-r border-[#1f2d45] flex-shrink-0">
        <span style={{ fontFamily: "Bebas Neue, var(--font-display)", letterSpacing: "0.1em" }}
          className="text-[#f5a623] text-[11px] sm:text-xs">⚽ WORLD CUP 2026</span>
      </div>
      <div className="flex-1 overflow-hidden ticker-wrap">
        <div className="ticker-track flex items-center gap-3 px-4">
          {content}
          {content}
        </div>
      </div>
      <style>{`
        .ticker-track { animation: ticker 40s linear infinite; will-change: transform; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (hover: hover) { .ticker-wrap:hover .ticker-track { animation-play-state: paused; } }
        @media (max-width: 767px) { :root { --ticker-h: 32px; } }
      `}</style>
    </div>
  );
}
