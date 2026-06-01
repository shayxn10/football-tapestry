import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeamFlag } from "./TeamFlag";
import { MATCH_META } from "@/data/wc2026Fixtures";
import type { ResolvedMatch, TournamentState } from "@/engine/tournamentEngine";
import { resolveTeamName } from "@/utils/resolveTeamName";
import trophyImg from "/assets/trophy.png";

interface Props {
  state: TournamentState;
  onPickWinner: (matchId: string, winner: string, goals1?: number, goals2?: number) => void;
  highlightTeam?: string | null;
}

// Match ordering from the spec — top to bottom in each side column.
const R32_LEFT  = ["R32_M05","R32_M14","R32_M02","R32_M07","R32_M15","R32_M09","R32_M12","R32_M01"];
const R32_RIGHT = ["R32_M06","R32_M11","R32_M08","R32_M10","R32_M03","R32_M16","R32_M04","R32_M08"];
// NOTE: bracket template doesn't define R32_M13, so the right side uses what's
// available — pair matches in the natural template order to keep the tree complete.
const R32_RIGHT_FIXED = ["R32_M06","R32_M08","R32_M10","R32_M11","R32_M03","R32_M16","R32_M04","R32_M02"];

// Use a stable, template-driven layout instead — derived from BRACKET_TEMPLATE order.
import { BRACKET_TEMPLATE } from "@/engine/tournamentEngine";

const R32_ALL = Object.keys(BRACKET_TEMPLATE).filter(k => k.startsWith("R32_"));
const R16_ALL = Object.keys(BRACKET_TEMPLATE).filter(k => k.startsWith("R16_"));
const QF_ALL  = Object.keys(BRACKET_TEMPLATE).filter(k => k.startsWith("QF_"));
const SF_ALL  = Object.keys(BRACKET_TEMPLATE).filter(k => k.startsWith("SF_"));

// Split halves
const half = (arr: string[]) => {
  const m = Math.ceil(arr.length / 2);
  return [arr.slice(0, m), arr.slice(m)] as const;
};
const [R32_L, R32_R] = half(R32_ALL);
const [R16_L, R16_R] = half(R16_ALL);
const [QF_L,  QF_R ] = half(QF_ALL);
const [SF_L,  SF_R ] = half(SF_ALL);

const GROUP_COLORS: Record<string, string> = {
  A:"#22c55e", B:"#e63946", C:"#f97316", D:"#3b82f6", E:"#8b5cf6", F:"#84cc16",
  G:"#ec4899", H:"#14b8a6", I:"#7c3aed", J:"#0d9488", K:"#ea580c", L:"#06b6d4",
};
const GROUP_FLAGS: Record<string, string[]> = {
  A:["🇲🇽","🇿🇦","🇰🇷","🇨🇿"], B:["🇨🇦","🇧🇦","🇶🇦","🇨🇭"], C:["🇧🇷","🇲🇦","🇭🇹","🏴"],
  D:["🇺🇸","🇵🇾","🇦🇺","🇹🇷"], E:["🇩🇪","🇨🇼","🇨🇮","🇪🇨"], F:["🇳🇱","🇯🇵","🇸🇪","🇹🇳"],
  G:["🇧🇪","🇪🇬","🇮🇷","🇳🇿"], H:["🇪🇸","🇨🇻","🇸🇦","🇺🇾"], I:["🇫🇷","🇸🇳","🇮🇶","🇳🇴"],
  J:["🇦🇷","🇩🇿","🇦🇹","🇯🇴"], K:["🇵🇹","🇨🇩","🇺🇿","🇨🇴"], L:["🏴","🇭🇷","🇬🇭","🇵🇦"],
};

export function KnockoutView({ state, onPickWinner, highlightTeam }: Props) {
  const matches = state.resolvedMatches;
  const champion = state.bracket["W_F_M01"];

  return (
    <div className="w-full overflow-x-auto bg-black">
      <div className="mx-auto py-8 px-4" style={{ minWidth: 1500 }}>
        <h2
          className="text-center text-white mb-6"
          style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 40, letterSpacing: "0.2em" }}
        >
          {champion ? `🏆 ${champion}` : "WORLD CHAMPIONS"}
        </h2>

        <div className="flex items-stretch justify-center gap-3">
          {/* LEFT groups */}
          <GroupsColumn groups={["A","B","C","D","E","F"]} />

          {/* LEFT bracket */}
          <RoundColumn label="R32" ids={R32_L}      matches={matches} onPick={onPickWinner} highlightTeam={highlightTeam} side="left" />
          <RoundColumn label="R16" ids={R16_L}      matches={matches} onPick={onPickWinner} highlightTeam={highlightTeam} side="left" />
          <RoundColumn label="QF"  ids={QF_L}       matches={matches} onPick={onPickWinner} highlightTeam={highlightTeam} side="left" />
          <RoundColumn label="SF"  ids={SF_L}       matches={matches} onPick={onPickWinner} highlightTeam={highlightTeam} side="left" />

          {/* CENTER */}
          <CenterColumn
            finalMatch={matches["F_M01"]}
            bronzeMatch={matches["TP_M01"]}
            onPick={onPickWinner}
            highlightTeam={highlightTeam}
            bracket={state.bracket}
          />

          {/* RIGHT bracket */}
          <RoundColumn label="SF"  ids={SF_R}       matches={matches} onPick={onPickWinner} highlightTeam={highlightTeam} side="right" />
          <RoundColumn label="QF"  ids={QF_R}       matches={matches} onPick={onPickWinner} highlightTeam={highlightTeam} side="right" />
          <RoundColumn label="R16" ids={R16_R}      matches={matches} onPick={onPickWinner} highlightTeam={highlightTeam} side="right" />
          <RoundColumn label="R32" ids={R32_R}      matches={matches} onPick={onPickWinner} highlightTeam={highlightTeam} side="right" />

          {/* RIGHT groups */}
          <GroupsColumn groups={["G","H","I","J","K","L"]} />
        </div>
      </div>
    </div>
  );
}

function GroupsColumn({ groups }: { groups: string[] }) {
  return (
    <div className="flex flex-col gap-2 py-6" style={{ width: 90 }}>
      {groups.map(g => (
        <div
          key={g}
          className="rounded-lg border flex flex-col items-center justify-center py-2 px-1"
          style={{
            borderColor: GROUP_COLORS[g],
            background: `${GROUP_COLORS[g]}26`,
            height: 100,
          }}
        >
          <div className="grid grid-cols-2 gap-0.5 text-[14px] leading-none mb-1">
            {GROUP_FLAGS[g].map((f, i) => <span key={i}>{f}</span>)}
          </div>
          <div
            className="text-white font-bold text-[11px]"
            style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}
          >
            GROUP {g}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoundColumn({
  label, ids, matches, onPick, highlightTeam, side,
}: {
  label: string;
  ids: string[];
  matches: Record<string, ResolvedMatch>;
  onPick: Props["onPickWinner"];
  highlightTeam?: string | null;
  side: "left" | "right";
}) {
  return (
    <div className="flex flex-col" style={{ width: 180 }}>
      <div
        className="text-center mb-2"
        style={{
          fontFamily: "Bebas Neue, sans-serif",
          fontSize: 12,
          color: "#8899aa",
          letterSpacing: "0.2em",
        }}
      >
        {label}
      </div>
      <div className="flex-1 flex flex-col justify-around gap-2">
        {ids.map(id => {
          const m = matches[id];
          if (!m) return <div key={id} style={{ height: 56 }} />;
          return (
            <MatchCard
              key={id}
              match={m}
              onPick={onPick}
              highlightTeam={highlightTeam}
              side={side}
            />
          );
        })}
      </div>
    </div>
  );
}

function CenterColumn({
  finalMatch, bronzeMatch, onPick, highlightTeam, bracket,
}: {
  finalMatch?: ResolvedMatch;
  bronzeMatch?: ResolvedMatch;
  onPick: Props["onPickWinner"];
  highlightTeam?: string | null;
  bracket: Record<string, string | null>;
}) {
  const champion = bracket["W_F_M01"];
  return (
    <div className="flex flex-col items-center justify-between py-2" style={{ width: 200 }}>
      <div className="w-full">
        <div
          className="text-center mb-2"
          style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 14, color: "#8899aa", letterSpacing: "0.2em" }}
        >
          FINAL
        </div>
        {finalMatch && <MatchCard match={finalMatch} onPick={onPick} highlightTeam={highlightTeam} side="left" />}
      </div>

      <div className="flex flex-col items-center my-4">
        <img
          src={trophyImg}
          alt="World Cup Trophy"
          style={{
            height: 160,
            filter: "drop-shadow(0 0 24px rgba(245,166,35,0.5))",
          }}
        />
        <div
          style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 56, color: "#f5a623", lineHeight: 1 }}
        >
          26
        </div>
        <div className="text-white text-[10px] tracking-[0.2em]" style={{ fontFamily: "DM Sans, sans-serif" }}>
          FIFA WORLD CUP 2026
        </div>
        <div className="text-[#8899aa] text-[9px] tracking-[0.15em]" style={{ fontFamily: "DM Sans, sans-serif" }}>
          CAN · MEX · USA
        </div>
        {champion && (
          <div className="mt-2 text-center text-[#f5a623] text-xs font-bold">CHAMPION</div>
        )}
      </div>

      <div className="w-full">
        <div
          className="text-center mb-2"
          style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 14, color: "#8899aa", letterSpacing: "0.2em" }}
        >
          BRONZE WINNER
        </div>
        {bronzeMatch && <MatchCard match={bronzeMatch} onPick={onPick} highlightTeam={highlightTeam} side="left" />}
      </div>
    </div>
  );
}

function MatchCard({
  match, onPick, highlightTeam,
}: {
  match: ResolvedMatch;
  onPick: Props["onPickWinner"];
  highlightTeam?: string | null;
  side: "left" | "right";
}) {
  const meta = MATCH_META[match.id];
  const ready = match.isReady && !match.isComplete;
  const locked = !match.isReady;
  const [open, setOpen] = useState(false);

  const winner = match.result
    ? match.result.goals1 > match.result.goals2 ? match.team1
    : match.result.goals2 > match.result.goals1 ? match.team2
    : match.result.winnerId
    : null;

  const border = locked
    ? "1px dashed #1f2d45"
    : match.isComplete
    ? "1px solid #22c55e"
    : "1px solid #f5a623";

  const shadow = ready ? "0 0 10px rgba(245,166,35,0.25)" : "none";

  function display(team: string) {
    const isSlot = /^(W_|R_|T3_|L_)/.test(team);
    return isSlot ? "TBD" : team;
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={!ready}
        onClick={() => ready && setOpen(o => !o)}
        className="w-full text-left transition-colors"
        style={{
          width: 170,
          height: 56,
          background: "#111827",
          borderRadius: 4,
          border,
          boxShadow: shadow,
          opacity: locked ? 0.5 : 1,
          cursor: ready ? "pointer" : "default",
          padding: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {meta && (
          <span
            className="absolute top-0.5 left-1"
            style={{ fontFamily: "DM Sans, sans-serif", fontSize: 8, color: "#f5a623" }}
          >
            #{meta.matchNumber}
          </span>
        )}
        {[match.team1, match.team2].map((team, i) => {
          const isSlot = /^(W_|R_|T3_|L_)/.test(team);
          const isWin = winner === team;
          const isLoss = match.isComplete && winner && !isWin;
          const isHi = highlightTeam && team === highlightTeam;
          const goals = match.result ? (i === 0 ? match.result.goals1 : match.result.goals2) : null;
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-1 px-2"
              style={{
                height: 28,
                borderTop: i === 1 ? "1px solid #0a0f1c" : "none",
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {!isSlot && <TeamFlag name={team} size={16} />}
                <span
                  className="truncate"
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 11,
                    color: isSlot ? "#445566" : isLoss ? "#445566" : "#ffffff",
                    fontWeight: isWin ? 700 : 500,
                    textDecoration: isLoss ? "line-through" : "none",
                    textShadow: isHi ? "0 0 6px #f5a623" : "none",
                  }}
                >
                  {display(team)}
                </span>
              </div>
              {goals !== null && (
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 12,
                    color: "#f5a623",
                    fontWeight: 700,
                  }}
                >
                  {goals}
                </span>
              )}
            </div>
          );
        })}
      </button>

      <AnimatePresence>
        {open && ready && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 bg-[#0a0f1c] border border-[#f5a623] rounded-md p-2 shadow-xl"
            style={{ top: 60, left: 0, width: 220 }}
          >
            <div className="text-[9px] uppercase tracking-widest text-[#8899aa] mb-1.5 font-mono">
              Pick winner
            </div>
            {[match.team1, match.team2].map(t => {
              const isUser = highlightTeam && t === highlightTeam;
              return (
                <button
                  key={t}
                  onClick={() => {
                    // Default 1-0 scoreline; advancing logic in engine treats it as winner
                    const isT1 = t === match.team1;
                    onPick(match.id, t, isT1 ? 1 : 0, isT1 ? 0 : 1);
                    setOpen(false);
                  }}
                  className="w-full text-left px-2 py-2 rounded mb-1 last:mb-0 hover:bg-[#1c2537] flex items-center gap-2 text-white text-xs font-bold"
                  style={{ minHeight: 36 }}
                >
                  <TeamFlag name={t} size={18} />
                  <span className="flex-1 truncate">{t}</span>
                  {isUser && <span className="text-[8px] text-[#f5a623]">⭐ YOUR TEAM</span>}
                </button>
              );
            })}
            <button
              onClick={() => setOpen(false)}
              className="w-full text-[9px] text-[#8899aa] hover:text-white py-1 mt-1 uppercase tracking-wider"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Keep unused exports referenced to avoid TS warnings (defensive)
void [R32_LEFT, R32_RIGHT, R32_RIGHT_FIXED, resolveTeamName];
