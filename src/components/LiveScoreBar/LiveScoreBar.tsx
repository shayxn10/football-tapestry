import { useEffect, useState } from "react";
import { useLiveScores, type ApiFixture } from "@/hooks/useLiveScores";
import { TEAM_CODES } from "@/utils/teamCodes";

const TOURNAMENT_START = new Date("2026-06-11T15:00:00-06:00");

function shortName(name: string): { code: string; flag: string } {
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] whitespace-nowrap"
        style={{ background: "rgba(230,57,70,0.12)", borderLeft: "2px solid #e63946" }}>
        <span className="inline-flex items-center gap-1 text-[#e63946] font-bold" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] whitespace-nowrap text-[#8899aa]">
        <span className="text-[#445566]">✓</span>
        <span>{home.flag}</span>
        <span className="hidden sm:inline">{home.code}</span>
        <span className="font-mono">{f.goals.home ?? 0}-{f.goals.away ?? 0}</span>
        <span className="hidden sm:inline">{away.code}</span>
        <span>{away.flag}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] whitespace-nowrap text-[#8899aa]">
      <span className="text-[#f5a623]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>{time}</span>
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
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    total: diff,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span style={{ fontFamily: "Bebas Neue, sans-serif", color: "#f5a623", fontSize: "13px", letterSpacing: "0.05em" }}>
        {value}
      </span>
      <span style={{ fontFamily: "DM Sans, sans-serif", color: "#8899aa", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </span>
    </span>
  );
}

const Sep = () => <span className="mx-2 text-[#445566]">·</span>;
const Bar = () => <span className="mx-3 inline-block w-px h-3 bg-[#1f2d45] align-middle" />;

function PreContent({ cd, isMobile }: { cd: ReturnType<typeof useCountdown>; isMobile: boolean }) {
  if (isMobile) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "11px", color: "#fff" }}>
        <span style={{ color: "#f5a623", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>KICKOFF</span>
        <CountdownUnit value={cd.days} label="D" />
        <CountdownUnit value={cd.hours} label="H" />
        <Bar />
        <span>🇲🇽 MEX</span>
        <span className="text-[#445566]">vs</span>
        <span>🇿🇦 RSA</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "12px", color: "#fff", letterSpacing: "0.05em" }}>
      <span style={{ color: "#f5a623", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.15em" }}>KICKOFF IN</span>
      <Sep />
      <CountdownUnit value={cd.days} label="D" />
      <Sep />
      <CountdownUnit value={cd.hours} label="H" />
      <Sep />
      <CountdownUnit value={cd.minutes} label="M" />
      <Bar />
      <span style={{ color: "#f5a623", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.15em" }}>OPENING MATCH</span>
      <Sep />
      <span>🇲🇽</span>
      <span className="ml-1.5 font-semibold">MEXICO</span>
      <span className="mx-2 text-[#8899aa]">vs</span>
      <span className="font-semibold">SOUTH AFRICA</span>
      <span className="ml-1.5">🇿🇦</span>
      <Bar />
      <span className="text-[#8899aa]">JUNE 11, 2026</span>
      <Sep />
      <span className="text-[#8899aa]">ESTADIO AZTECA</span>
    </span>
  );
}

export function LiveScoreBar() {
  const { fixtures, phase } = useLiveScores();
  const cd = useCountdown();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const upd = () => setIsMobile(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  let content: React.ReactNode;
  if (phase === "pre") {
    content = <PreContent cd={cd} isMobile={isMobile} />;
  } else if (phase === "post") {
    content = (
      <span className="whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "12px", color: "#f5a623" }}>
        🏆 World Cup 2026 has concluded · Thanks for following
      </span>
    );
  } else if (fixtures.length === 0) {
    content = <span className="text-[#445566] text-[12px] px-2 whitespace-nowrap">No matches today</span>;
  } else {
    content = (
      <span className="inline-flex items-center">
        {fixtures.map((f, i) => (
          <span key={f.fixture.id} className="inline-flex items-center">
            <MatchPill f={f} />
            {i < fixtures.length - 1 && <Bar />}
          </span>
        ))}
      </span>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 w-full z-[2000] flex items-stretch overflow-hidden"
      style={{
        height: "var(--ticker-h, 36px)",
        background: "#000000",
        borderBottom: "1px solid rgba(245,166,35,0.4)",
      }}
    >
      {/* Warm gold left wash overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to right, rgba(245,166,35,0.08) 0%, transparent 300px)" }}
      />

      {/* Left anchor (static) */}
      <div className="relative flex items-center pl-3 sm:pl-4 pr-2 sm:pr-3 flex-shrink-0">
        <span className="inline-block rounded-full bg-[#e63946] mr-1.5" style={{ width: 6, height: 6, animation: "livePulse 1.5s ease-in-out infinite" }} />
        <span style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.2em", color: "#f5a623", fontSize: "12px" }}>
          <span className="sm:hidden">⚽ WC26</span>
          <span className="hidden sm:inline">⚽ WORLD CUP 2026</span>
        </span>
        <span className="inline-block ml-3" style={{ width: 1, height: 18, background: "rgba(245,166,35,0.3)" }} />
      </div>

      {/* Scrolling content */}
      <div className="relative flex-1 overflow-hidden ticker-wrap">
        <div className="ticker-track inline-flex items-center">
          <span className="inline-flex items-center pr-8">{content}</span>
          <span className="inline-flex items-center pr-8" aria-hidden="true">{content}</span>
        </div>
      </div>

      <style>{`
        @keyframes livePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.8); }
        }
        .ticker-track {
          animation: tickerScroll 60s linear infinite;
          will-change: transform;
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (hover: hover) {
          .ticker-wrap:hover .ticker-track { animation-play-state: paused; }
        }
        @media (max-width: 767px) {
          :root { --ticker-h: 32px; }
        }
      `}</style>
    </div>
  );
}
