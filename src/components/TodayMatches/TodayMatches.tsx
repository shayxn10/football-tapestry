import { useLiveScores, type ApiFixture } from "@/hooks/useLiveScores";
import { TEAM_CODES } from "@/utils/teamCodes";

const FONT_DISPLAY = "Bebas Neue, sans-serif";
const FONT_BODY = "DM Sans, sans-serif";

function shortName(name: string) {
  if (TEAM_CODES[name]) return TEAM_CODES[name];
  for (const k of Object.keys(TEAM_CODES)) {
    if (name.toLowerCase().includes(k.toLowerCase())) return TEAM_CODES[k];
  }
  return { code: name.slice(0, 3).toUpperCase(), flag: "🏳️" };
}

function TeamColumn({ flag, code, highlight }: { flag: string; code: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <span style={{ fontSize: 28, lineHeight: 1 }}>{flag}</span>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 18,
          letterSpacing: "0.04em",
          color: highlight ? "#f5a623" : "#ffffff",
        }}
      >
        {code}
      </span>
    </div>
  );
}

function MatchDayCard({ f }: { f: ApiFixture }) {
  const home = shortName(f.teams.home.name);
  const away = shortName(f.teams.away.name);
  const status = f.fixture.status.short;
  const isLive = ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(status);
  const isDone = ["FT", "AET", "PEN"].includes(status);
  const isUpcoming = !isLive && !isDone;
  const kickoff = new Date(f.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const elapsed = f.fixture.status.elapsed;

  const hGoals = f.goals.home ?? 0;
  const aGoals = f.goals.away ?? 0;
  const homeWin = isDone && hGoals > aGoals;
  const awayWin = isDone && aGoals > hGoals;

  const round = (f.league?.round || "MATCH").replace(/^Group /i, "GROUP ").toUpperCase();
  const borderTopColor = isLive ? "#e63946" : isDone ? "#22c55e" : "#1e2d42";

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        minWidth: 240,
        width: 240,
        background: "#0f1623",
        border: "1px solid #1e2d42",
        borderTop: `2px solid ${borderTopColor}`,
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      {/* Status badge */}
      {isLive && (
        <span
          className="absolute"
          style={{
            top: 8,
            right: 8,
            background: "rgba(230,57,70,0.1)",
            border: "1px solid #e63946",
            color: "#e63946",
            borderRadius: 4,
            padding: "2px 8px",
            fontFamily: FONT_BODY,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            animation: "liveBadgePulse 1.5s ease-in-out infinite",
          }}
        >
          LIVE
        </span>
      )}
      {isDone && (
        <span
          className="absolute"
          style={{
            top: 8,
            right: 8,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid #22c55e",
            color: "#22c55e",
            borderRadius: 4,
            padding: "2px 8px",
            fontFamily: FONT_BODY,
            fontSize: 10,
            letterSpacing: "0.1em",
          }}
        >
          FT
        </span>
      )}

      {/* Top row: group + time */}
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 11,
          color: "#8899aa",
          letterSpacing: "0.1em",
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        {round} · {kickoff}
      </div>

      {/* Middle: teams + center */}
      <div className="flex items-center gap-2">
        <TeamColumn flag={home.flag} code={home.code} highlight={homeWin} />

        <div className="flex flex-col items-center justify-center px-1" style={{ minWidth: 70 }}>
          {isUpcoming && (
            <>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: "#445566", letterSpacing: "0.05em" }}>vs</span>
              <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: "#f5a623", marginTop: 4 }}>{kickoff}</span>
            </>
          )}
          {(isLive || isDone) && (
            <>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 32,
                  color: isLive ? "#f5a623" : "#ffffff",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                }}
              >
                {hGoals} - {aGoals}
              </span>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5" style={{ marginTop: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: "#e63946",
                      animation: "liveBadgePulse 1.5s ease-in-out infinite",
                    }}
                  />
                  <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: "#e63946", fontWeight: 600 }}>
                    {elapsed != null ? `${elapsed}'` : "LIVE"}
                  </span>
                </span>
              ) : (
                <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: "#22c55e", marginTop: 6, letterSpacing: "0.1em" }}>FT</span>
              )}
            </>
          )}
        </div>

        <TeamColumn flag={away.flag} code={away.code} highlight={awayWin} />
      </div>

      {/* Bottom divider for finished/live */}
      {(isLive || isDone) && (
        <div style={{ height: 1, background: "#1e2d42", marginTop: 14 }} />
      )}
    </div>
  );
}

export function TodayMatches() {
  const { fixtures, loading } = useLiveScores();
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="w-full">
      <header className="flex items-end justify-between mb-3">
        <h3 style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.04em", color: "#ffffff", fontSize: 24 }}>
          TODAY'S MATCHES
        </h3>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: "#8899aa" }}>{today}</span>
      </header>
      {/* Gold gradient underline */}
      <div
        style={{
          height: 1,
          width: 200,
          background: "linear-gradient(to right, #f5a623, transparent)",
          marginBottom: 20,
        }}
      />
      {loading && <p style={{ color: "#445566", fontFamily: FONT_BODY, fontSize: 14 }}>Loading fixtures…</p>}
      {!loading && fixtures.length === 0 && (
        <p style={{ color: "#445566", fontFamily: FONT_BODY, fontSize: 14 }}>No matches scheduled today.</p>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {fixtures.slice(0, 8).map((f) => (
          <MatchDayCard key={f.fixture.id} f={f} />
        ))}
      </div>
      <style>{`
        @keyframes liveBadgePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
