import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { TEAM_CODES } from "@/utils/teamCodes";
import { recordWinner } from "@/hooks/useLeaderboard";
import { SimulatorLeaderboard } from "@/components/simulator/SimulatorLeaderboard";
const trophyImg = "/assets/trophy.png";

export interface TopFour {
  champion: string;
  runnerUp?: string | null;
  third?: string | null;
  fourth?: string | null;
}

interface Props extends TopFour {
  finalScore?: string;
  isUserTeam?: boolean;
  onDismiss: () => void;
}

const SHARE_BTN: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 6,
  padding: "12px 20px",
  color: "#f0f4ff",
  fontFamily: "DM Sans, system-ui, sans-serif",
  fontSize: 13,
  cursor: "pointer",
  transition: "all 160ms ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

function metaOf(team?: string | null) {
  if (!team) return { code: "TBD", flag: "🏳️" };
  return TEAM_CODES[team] ?? { code: team.slice(0, 3).toUpperCase(), flag: "🏳️" };
}

const XLogo = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-6.99L4.6 22H1.34l8.02-9.17L1 2h6.91l4.85 6.41L18.244 2Zm-1.2 18h1.86L7.06 4H5.1l11.945 16Z" />
  </svg>
);

export function ChampionReveal({
  champion, runnerUp, third, fourth, finalScore, isUserTeam, onDismiss,
}: Props) {
  const fired = useRef(false);
  const recorded = useRef(false);
  const [lbKey, setLbKey] = useState(0);
  const meta = metaOf(champion);
  const runnerMeta = metaOf(runnerUp);
  const thirdMeta = metaOf(third);
  const fourthMeta = metaOf(fourth);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const TEAM_CONFETTI_COLORS: Record<string, string[]> = {
      "Argentina": ["#74ACDF", "#ffffff", "#F5A623"],
      "France": ["#002395", "#ffffff", "#ED2939"],
      "Brazil": ["#009C3B", "#FFDF00", "#002776"],
      "England": ["#ffffff", "#CF091B", "#F5A623"],
      "Spain": ["#c60b1e", "#f1bf00", "#ffffff"],
      "Portugal": ["#006600", "#ff0000", "#ffffff"],
      "Germany": ["#000000", "#DD0000", "#FFCE00"],
      "Netherlands": ["#FF6600", "#ffffff", "#003DA5"],
      "Belgium": ["#000000", "#FDDA24", "#EF3340"],
      "Uruguay": ["#5EB6E4", "#ffffff", "#F5A623"],
      "Morocco": ["#C1272D", "#006233", "#ffffff"],
      "Colombia": ["#FCD116", "#003087", "#CE1126"],
      "Croatia": ["#FF0000", "#ffffff", "#003DA5"],
      "USA": ["#B22234", "#ffffff", "#3C3B6E"],
      "Mexico": ["#006847", "#ffffff", "#CE1126"],
      "Japan": ["#BC002D", "#ffffff", "#F5A623"],
      "Senegal": ["#00853F", "#FDEF42", "#E31B23"],
      "Switzerland": ["#FF0000", "#ffffff", "#F5A623"],
      "Ecuador": ["#FFD100", "#003DA5", "#CE1126"],
      "Canada": ["#FF0000", "#ffffff", "#F5A623"],
    };
    const champColors = TEAM_CONFETTI_COLORS[champion] ?? ["#f5a623", "#ffffff", "#ffd700", "#c0a060"];
    const goldColors = ["#f5a623", "#ffffff", "#ffd700"];

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | undefined;

    const timer = setTimeout(() => {
      confetti({
        particleCount: 120, angle: 60, spread: 70,
        origin: { x: 0, y: 0.75 },
        colors: champColors, gravity: 0.8, scalar: 1.2, drift: 0.5,
      });
      timeouts.push(setTimeout(() => {
        confetti({
          particleCount: 120, angle: 120, spread: 70,
          origin: { x: 1, y: 0.75 },
          colors: champColors, gravity: 0.8, scalar: 1.2, drift: -0.5,
        });
      }, 50));
      timeouts.push(setTimeout(() => {
        confetti({
          particleCount: 200, angle: 90, spread: 120,
          origin: { x: 0.5, y: 0 },
          colors: champColors, gravity: 0.6, scalar: 0.9, ticks: 300,
        });
      }, 300));
      let count = 0;
      interval = setInterval(() => {
        count++;
        confetti({
          particleCount: 60, angle: 60, spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: goldColors, gravity: 0.9, scalar: 1.0,
        });
        confetti({
          particleCount: 60, angle: 120, spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: goldColors, gravity: 0.9, scalar: 1.0,
        });
        if (count >= 5 && interval) clearInterval(interval);
      }, 600);
    }, 500);

    return () => {
      clearTimeout(timer);
      timeouts.forEach(clearTimeout);
      if (interval) clearInterval(interval);
      confetti.reset();
    };
  }, [champion]);

  useEffect(() => {
    if (recorded.current) return;
    if (!champion) return;
    recorded.current = true;
    recordWinner(champion).then(() => setLbKey(k => k + 1));
  }, []);


  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  function handleTweet() {
    const lines = [
      `🏆 ${meta.flag} ${champion} are FIFA World Cup 2026 Champions!`,
      "",
      "🥇 " + champion,
      runnerUp ? `🥈 ${runnerUp}` : "",
      third ? `🥉 ${third}` : "",
      fourth ? `4️⃣ ${fourth}` : "",
      "",
      "Simulate yours 👇",
      "#WorldCup2026 #FIFA2026",
    ].filter(Boolean).join("\n");
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(lines)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleDownload() {
    const card = document.getElementById("share-card");
    if (!card) return;
    try {
      const canvas = await html2canvas(card, {
        backgroundColor: "#000000",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `wc2026-${champion.toLowerCase().replace(/\s+/g, "-")}-top4.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("[download] failed", err);
      alert("Sorry — couldn't generate the image. Try again.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6 overflow-y-auto py-10"
      style={{ background: "#000" }}
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative"
      >
        <motion.div
          aria-hidden
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(circle, rgba(245,166,35,0.4) 0%, transparent 70%)",
            transform: "scale(2)",
          }}
        />
        <img src={trophyImg} alt="World Cup Trophy"
          className="mx-auto"
          style={{ height: "min(220px, 35vh)", filter: "drop-shadow(0 0 30px rgba(245,166,35,0.6))" }} />
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="mt-6"
        style={{ fontSize: "min(120px, 18vw)", lineHeight: 1 }}
      >
        {meta.flag}
      </motion.div>

      {isUserTeam && (
        <motion.p
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.4 }}
          className="mt-4 text-[#f5a623] text-sm sm:text-base"
          style={{ fontFamily: "Bebas Neue, var(--font-display)", letterSpacing: "0.2em" }}
        >
          YOUR TEAM WON THE WORLD CUP
        </motion.p>
      )}

      <motion.h1
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.5 }}
        className="mt-4 text-white text-center"
        style={{
          fontFamily: "Bebas Neue, var(--font-display)",
          letterSpacing: "0.15em",
          fontSize: "clamp(40px, 8vw, 96px)",
          lineHeight: 1,
        }}
      >
        WORLD CHAMPIONS 2026
      </motion.h1>

      <motion.h2
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="mt-4 text-center"
        style={{
          fontFamily: "Bebas Neue, var(--font-display)",
          color: "#f5a623",
          fontSize: "clamp(32px, 6vw, 72px)",
          textShadow: "0 0 40px rgba(245,166,35,0.8)",
          lineHeight: 1,
        }}
      >
        {champion}
      </motion.h2>

      {/* Share row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.6, duration: 0.4 }}
        className="mt-10 w-full max-w-md"
      >
        <p
          className="text-center"
          style={{
            fontFamily: "Bebas Neue, var(--font-display)",
            fontSize: 16,
            color: "#8899aa",
            letterSpacing: "0.15em",
            marginBottom: 16,
          }}
        >
          SHARE YOUR RESULT
        </p>
        <div className="flex justify-center px-2">
          <button
            style={{ ...SHARE_BTN, minWidth: 220 }}
            onClick={handleTweet}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,166,35,0.1)";
              e.currentTarget.style.borderColor = "rgba(245,166,35,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
          >
            <XLogo /> Post on X
          </button>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.8, duration: 0.4 }}
        className="mt-10 w-full"
        style={{ maxWidth: 480 }}
      >
        <p
          className="text-center"
          style={{
            fontFamily: "Bebas Neue, var(--font-display)",
            fontSize: 14,
            color: "#8899aa",
            letterSpacing: "0.2em",
            marginBottom: 12,
          }}
        >
          SEE HOW OTHERS SIMULATED
        </p>
        <SimulatorLeaderboard refreshKey={lbKey} />
      </motion.div>


      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 4.0, duration: 0.3 }}
        onClick={onDismiss}
        className="mt-6 sm:mt-0 sm:absolute sm:bottom-8 sm:right-8 px-5 py-3 rounded text-sm text-white hover:bg-white/10"
        style={{ border: "1px solid #1f2d45", fontFamily: "var(--font-display)" }}
      >
        Continue →
      </motion.button>

      {/* Hidden share card for PNG export — TOP 4 layout */}
      <div
        id="share-card"
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          width: 720,
          height: 540,
          background: "linear-gradient(180deg, #0a0a0a 0%, #1a1208 100%)",
          borderTop: "6px solid #f5a623",
          padding: "28px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "DM Sans, system-ui, sans-serif",
          color: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <div style={{
          fontFamily: "Bebas Neue, var(--font-display)",
          fontSize: 13,
          letterSpacing: "0.3em",
          color: "#8899aa",
        }}>
          ⚽ FIFA WORLD CUP 2026 · TOP 4
        </div>

        <div style={{
          fontFamily: "Bebas Neue, var(--font-display)",
          fontSize: 34,
          color: "#ffffff",
          marginTop: 8,
          letterSpacing: "0.1em",
        }}>
          FINAL STANDINGS
        </div>

        <div style={{
          width: 140,
          height: 2,
          background: "linear-gradient(90deg, transparent, #f5a623, transparent)",
          marginTop: 8,
          marginBottom: 18,
        }} />

        {/* Podium row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <PodiumRow
            place="1"
            medal="🥇"
            label="CHAMPION"
            team={champion}
            flag={meta.flag}
            accent="#f5a623"
            bg="rgba(245,166,35,0.14)"
            border="rgba(245,166,35,0.55)"
            big
          />
          <PodiumRow
            place="2"
            medal="🥈"
            label="RUNNER-UP"
            team={runnerUp ?? "—"}
            flag={runnerMeta.flag}
            accent="#c9c9d1"
            bg="rgba(200,200,210,0.08)"
            border="rgba(200,200,210,0.35)"
          />
          <PodiumRow
            place="3"
            medal="🥉"
            label="THIRD PLACE"
            team={third ?? "—"}
            flag={thirdMeta.flag}
            accent="#cd7f32"
            bg="rgba(205,127,50,0.10)"
            border="rgba(205,127,50,0.45)"
          />
          <PodiumRow
            place="4"
            medal="4"
            label="FOURTH PLACE"
            team={fourth ?? "—"}
            flag={fourthMeta.flag}
            accent="#8899aa"
            bg="rgba(136,153,170,0.08)"
            border="rgba(136,153,170,0.30)"
          />
        </div>

        {finalScore && runnerUp && (
          <div style={{ fontSize: 12, color: "#8899aa", marginTop: 14 }}>
            Final: {champion} {finalScore} {runnerUp}
          </div>
        )}

        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: "#8899aa" }}>Simulate yours:</div>
        <div style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "#f5a623", marginTop: 2 }}>
          football-tapestry.lovable.app
        </div>
      </div>
    </motion.div>
  );
}

function PodiumRow({
  place, medal, label, team, flag, accent, bg, border, big,
}: {
  place: string; medal: string; label: string; team: string; flag: string;
  accent: string; bg: string; border: string; big?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: big ? "14px 18px" : "10px 18px",
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 8,
      width: "100%",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: 40, textAlign: "center",
        fontFamily: "Bebas Neue, var(--font-display)",
        fontSize: big ? 36 : 26, color: accent, lineHeight: 1,
      }}>{place}</div>
      <div style={{ fontSize: big ? 36 : 28, lineHeight: 1 }}>{medal}</div>
      <div style={{ fontSize: big ? 34 : 26, lineHeight: 1 }}>{flag}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "Bebas Neue, var(--font-display)",
          fontSize: big ? 28 : 20, color: "#ffffff",
          letterSpacing: "0.06em", lineHeight: 1,
        }}>{team}</div>
        <div style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: 10, color: "#8899aa", letterSpacing: "0.2em",
          marginTop: 4,
        }}>{label}</div>
      </div>
    </div>
  );
}
