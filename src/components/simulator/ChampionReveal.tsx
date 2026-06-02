import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { TEAM_CODES } from "@/utils/teamCodes";
const trophyImg = "/assets/trophy.png";

interface Props {
  champion: string;
  runnerUp?: string | null;
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
};

export function ChampionReveal({ champion, runnerUp, finalScore, isUserTeam, onDismiss }: Props) {
  const fired = useRef(false);
  const meta = TEAM_CODES[champion] ?? { code: champion.slice(0, 3).toUpperCase(), flag: "🏆" };
  const runnerMeta = runnerUp ? TEAM_CODES[runnerUp] ?? { code: runnerUp.slice(0, 3).toUpperCase(), flag: "🏳️" } : null;
  const [copyLabel, setCopyLabel] = useState("🔗 Copy Link");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const colors = ["#f5a623", "#ffffff", "#e63946"];
    const end = Date.now() + 4000;
    const fire = () => {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 1 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(fire);
    };
    const t = setTimeout(fire, 300);
    return () => clearTimeout(t);
  }, []);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const scoreLine = runnerUp && finalScore
    ? `Final: ${champion} ${finalScore} ${runnerUp}`
    : `${champion} are World Champions`;

  async function handleNativeShare() {
    const shareData = {
      title: "FIFA World Cup 2026 Simulator",
      text: `🏆 ${champion} are World Champions in my FIFA World Cup 2026 simulation!\n\nWho wins yours?`,
      url: shareUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  }

  function handleTweet() {
    const tweetText = encodeURIComponent(
      `🏆 ${meta.flag} ${champion} are World Champions!\n\n` +
      (runnerUp && finalScore ? `Final: ${champion} ${finalScore} ${runnerUp}\n\n` : "") +
      `Simulated on the FIFA World Cup 2026 Simulator 👇\n` +
      `#WorldCup2026 #FIFA2026 #${champion.replace(/\s+/g, "")}`
    );
    const url = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleDownload() {
    const card = document.getElementById("share-card");
    if (!card) return;
    const canvas = await html2canvas(card, { backgroundColor: "#000000", scale: 2 });
    const link = document.createElement("a");
    link.download = `wc2026-${champion.toLowerCase().replace(/\s+/g, "-")}-champion.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyLabel("✓ Copied!");
      setTimeout(() => setCopyLabel("🔗 Copy Link"), 2000);
    } catch {
      setCopyLabel("✗ Failed");
      setTimeout(() => setCopyLabel("🔗 Copy Link"), 2000);
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
        className="mt-10 w-full max-w-2xl"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-2">
          {canNativeShare && (
            <button
              style={SHARE_BTN}
              onClick={handleNativeShare}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(245,166,35,0.1)";
                e.currentTarget.style.borderColor = "rgba(245,166,35,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}
            >📱 Share</button>
          )}
          <button
            style={SHARE_BTN}
            onClick={handleTweet}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,166,35,0.1)";
              e.currentTarget.style.borderColor = "rgba(245,166,35,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
          >🐦 Post on X</button>
          <button
            style={SHARE_BTN}
            onClick={handleDownload}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,166,35,0.1)";
              e.currentTarget.style.borderColor = "rgba(245,166,35,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
          >📸 Download</button>
          <button
            style={SHARE_BTN}
            onClick={handleCopyLink}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,166,35,0.1)";
              e.currentTarget.style.borderColor = "rgba(245,166,35,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
          >{copyLabel}</button>
        </div>
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

      {/* Hidden share card for png export */}
      <div
        id="share-card"
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          width: 600,
          height: 400,
          background: "#000000",
          borderTop: "4px solid #f5a623",
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          fontFamily: "DM Sans, system-ui, sans-serif",
          color: "#ffffff",
        }}
      >
        <div style={{
          fontFamily: "Bebas Neue, var(--font-display)",
          fontSize: 14,
          letterSpacing: "0.25em",
          color: "#8899aa",
        }}>
          ⚽ FIFA WORLD CUP 2026 SIMULATOR
        </div>
        <div style={{ fontSize: 60, lineHeight: 1, marginTop: 14 }}>{meta.flag}</div>
        <div style={{
          fontFamily: "Bebas Neue, var(--font-display)",
          fontSize: 48,
          color: "#f5a623",
          lineHeight: 1,
          marginTop: 10,
          letterSpacing: "0.05em",
        }}>{champion.toUpperCase()}</div>
        <div style={{
          fontFamily: "Bebas Neue, var(--font-display)",
          fontSize: 24,
          color: "#ffffff",
          lineHeight: 1,
          marginTop: 8,
          letterSpacing: "0.15em",
        }}>ARE WORLD CHAMPIONS</div>
        {runnerMeta && finalScore && (
          <div style={{ fontSize: 16, color: "#8899aa", marginTop: 14 }}>
            Final: {champion} {finalScore} {runnerUp}
          </div>
        )}
        <div style={{
          width: 120,
          height: 1,
          background: "linear-gradient(90deg, transparent, #f5a623, transparent)",
          marginTop: 18,
        }} />
        <div style={{ fontSize: 11, color: "#8899aa", marginTop: 14 }}>Simulate yours:</div>
        <div style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "#f5a623", marginTop: 4 }}>
          football-tapestry.lovable.app
        </div>
      </div>
    </motion.div>
  );
}
