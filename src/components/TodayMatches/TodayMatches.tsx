import { useLiveScores, type ApiFixture } from "@/hooks/useLiveScores";
import { TEAM_CODES } from "@/utils/teamCodes";

function shortName(name: string) {
  if (TEAM_CODES[name]) return TEAM_CODES[name];
  for (const k of Object.keys(TEAM_CODES)) {
    if (name.toLowerCase().includes(k.toLowerCase())) return TEAM_CODES[k];
  }
  return { code: name.slice(0, 3).toUpperCase(), flag: "🏳️" };
}

function MatchDayCard({ f }: { f: ApiFixture }) {
  const home = shortName(f.teams.home.name);
  const away = shortName(f.teams.away.name);
  const status = f.fixture.status.short;
  const isLive = ["1H","2H","HT","ET","P","LIVE"].includes(status);
  const isDone = ["FT","AET","PEN"].includes(status);
  const isUpcoming = !isLive && !isDone;
  const kickoff = new Date(f.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const round = (f.league?.round || "").replace(/^Group /, "GROUP ");

  return (
    <div className="rounded-lg p-4 w-full sm:w-[220px] flex-shrink-0 relative"
      style={{
        background: "#111827",
        border: "1px solid #1f2d45",
        borderTopWidth: isLive ? 2 : 1,
        borderTopColor: isLive ? "#e63946" : "#1f2d45",
      }}>
      {isLive && (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
          style={{ background: "#e63946" }}>LIVE</span>
      )}
      <div className="text-[11px] text-[#8899aa] mb-3 uppercase tracking-wider">
        {round || "MATCH"} · {kickoff}
      </div>
      <div className="space-y-2">
        {[
          { side: home, goals: f.goals.home, name: f.teams.home.name },
          { side: away, goals: f.goals.away, name: f.teams.away.name },
        ].map((t, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white">
              <span>{t.side.flag}</span>
              <span className="font-medium truncate">{t.side.code}</span>
            </span>
            {isUpcoming
              ? <span className="text-[#445566] text-xs">vs</span>
              : <span style={{ fontFamily: "Bebas Neue, var(--font-display)", color: "#f5a623" }} className="text-xl">{t.goals ?? 0}</span>}
          </div>
        ))}
      </div>
      {f.fixture.venue?.name && (
        <div className="mt-3 text-[11px] text-[#445566] truncate">{f.fixture.venue.name}</div>
      )}
    </div>
  );
}

export function TodayMatches() {
  const { fixtures, loading } = useLiveScores();
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="w-full">
      <header className="flex items-end justify-between mb-5">
        <h3 style={{ fontFamily: "Bebas Neue, var(--font-display)", letterSpacing: "0.04em" }}
          className="text-white text-2xl">TODAY'S MATCHES</h3>
        <span className="text-xs text-[#8899aa]">{today}</span>
      </header>
      {loading && <p className="text-[#445566] text-sm">Loading fixtures…</p>}
      {!loading && fixtures.length === 0 && (
        <p className="text-[#445566] text-sm">No matches scheduled today.</p>
      )}
      <div className="flex sm:grid gap-3 overflow-x-auto pb-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        {fixtures.slice(0, 8).map(f => <MatchDayCard key={f.fixture.id} f={f} />)}
      </div>
    </div>
  );
}
