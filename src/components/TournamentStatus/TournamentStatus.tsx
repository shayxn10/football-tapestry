import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { TodayMatches } from "@/components/TodayMatches/TodayMatches";
import wc2026Logo from "@/assets/wc2026-logo.png";

const TOURNAMENT_START = new Date("2026-06-11T15:00:00-06:00");
const TOURNAMENT_END = new Date("2026-07-19T23:59:59-04:00");

const CHAMPION = { name: "", flag: "", date: "July 19, 2026 · New York / New Jersey" };

function getPhase(now = new Date()) {
  if (now < TOURNAMENT_START) return "pre" as const;
  if (now > TOURNAMENT_END) return "post" as const;
  return "live" as const;
}

function FlipNumber({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-md
                 w-[80px] sm:w-[120px] xl:w-[160px]"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(245,166,35,0.15)",
        padding: "28px 16px 20px",
        perspective: "400px",
      }}
    >
      <div
        className="absolute top-0 left-0 w-full"
        style={{ height: 1, background: "rgba(245,166,35,0.3)" }}
      />
      <div style={{ transformStyle: "preserve-3d" }} className="h-[56px] sm:h-[72px] xl:h-[96px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={{
              fontFamily: "Bebas Neue, var(--font-display)",
              color: "#f5a623",
              lineHeight: 1,
              display: "inline-block",
            }}
            className="text-[52px] sm:text-[72px] xl:text-[96px] tabular-nums"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className="mt-2 text-[10px] sm:text-[11px] text-center"
        style={{
          color: "#8899aa",
          letterSpacing: "0.25em",
          fontFamily: "var(--font-display)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Colon({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  return (
    <span
      className={`${hideOnMobile ? "hidden sm:inline" : ""} self-start`}
      style={{
        fontFamily: "Bebas Neue, var(--font-display)",
        color: "#f5a623",
        paddingTop: 16,
        animation: "blink 1s infinite",
        lineHeight: 1,
      }}
    >
      <span className="text-[40px] sm:text-[64px]">:</span>
    </span>
  );
}


function PitchBackground() {
  // Pure CSS/SVG football pitch — scales perfectly at all sizes.
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {/* Grass */}
      <div className="absolute inset-0" style={{ background: "#2d7a3a" }} />
      {/* Subtle horizontal mow stripes */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 40px, rgba(0,0,0,0.04) 40px 80px)",
        }}
      />
      {/* Pitch markings (opacity 0.25) */}
      <div className="absolute inset-0" style={{ opacity: 0.25 }}>
        {/* Outer border */}
        <div
          className="absolute"
          style={{ inset: 20, border: "3px solid #fff", borderRadius: 4 }}
        />
        {/* Halfway line */}
        <div
          className="absolute left-5 right-5"
          style={{ top: "50%", height: 3, background: "#fff" }}
        />
        {/* Center circle */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            width: 140,
            height: 140,
            border: "3px solid #fff",
            borderRadius: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
        {/* Center spot */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            width: 8,
            height: 8,
            background: "#fff",
            borderRadius: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
        {/* Left penalty box */}
        <div
          className="absolute"
          style={{
            left: 20,
            top: "30%",
            width: "22%",
            height: "40%",
            borderTop: "3px solid #fff",
            borderRight: "3px solid #fff",
            borderBottom: "3px solid #fff",
          }}
        />
        {/* Right penalty box */}
        <div
          className="absolute"
          style={{
            right: 20,
            top: "30%",
            width: "22%",
            height: "40%",
            borderTop: "3px solid #fff",
            borderLeft: "3px solid #fff",
            borderBottom: "3px solid #fff",
          }}
        />
      </div>
      {/* Dimming overlay so foreground text is legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}

function PhaseCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, TOURNAMENT_START.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
      {/* Top badge */}
      <div className="flex justify-center mb-6">
        <span
          className="inline-flex items-center gap-2"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: "6px 20px",
            color: "#fff",
            fontFamily: "var(--font-sans), DM Sans",
            fontSize: 12,
            letterSpacing: "0.1em",
          }}
        >
          <img src={wc2026Logo} alt="" style={{ height: 20, width: "auto" }} />
          FIFA World Cup 2026 · Official Data
        </span>
      </div>

      {/* Headline */}
      <h3
        className="text-[36px] sm:text-[48px] xl:text-[56px] mb-6"
        style={{
          fontFamily: "Bebas Neue, var(--font-display)",
          letterSpacing: "0.05em",
          lineHeight: 1,
        }}
      >
        <span style={{ color: "#fff" }}>THE WAIT IS </span>
        <span style={{ color: "#f5a623" }}>ALMOST OVER</span>
      </h3>

      {/* Countdown numbers */}
      <div className="flex items-start justify-center gap-1 sm:gap-1.5">
        <FlipNumber value={d} label="Days" />
        <Colon />
        <FlipNumber value={h} label="Hours" />
        <Colon />
        <FlipNumber value={m} label="Mins" />
        <Colon hideOnMobile />
        <FlipNumber value={s} label="Secs" />
      </div>

      {/* Opening match card */}
      <div
        className="mx-auto"
        style={{
          background: "rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          padding: "16px 32px",
          maxWidth: 520,
          margin: "28px auto 0",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans), DM Sans",
            color: "#f5a623",
            fontSize: 11,
            letterSpacing: "0.15em",
            marginBottom: 10,
          }}
        >
          ⚽ OPENING MATCH · JUNE 11, 2026 · 15:00 EST
        </p>
        <p
          className="hidden sm:block"
          style={{
            fontFamily: "Bebas Neue, var(--font-display)",
            color: "#fff",
            fontSize: 32,
            lineHeight: 1.1,
            letterSpacing: "0.05em",
          }}
        >
          🇲🇽&nbsp;&nbsp;MEXICO&nbsp;&nbsp;
          <span style={{ color: "#f5a623", fontSize: 24 }}>vs</span>
          &nbsp;&nbsp;SOUTH AFRICA&nbsp;&nbsp;🇿🇦
        </p>
        <div
          className="sm:hidden flex flex-col items-center"
          style={{
            fontFamily: "Bebas Neue, var(--font-display)",
            color: "#fff",
            fontSize: 22,
            lineHeight: 1.2,
            letterSpacing: "0.05em",
          }}
        >
          <span>🇲🇽 MEXICO</span>
          <span style={{ color: "#f5a623", fontSize: 16 }}>vs</span>
          <span>SOUTH AFRICA 🇿🇦</span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-sans), DM Sans",
            color: "#8899aa",
            fontSize: 12,
            marginTop: 8,
          }}
        >
          Estadio Azteca · Mexico City, Mexico
        </p>
      </div>

      {/* CTA */}
      <Link
        to="/simulator"
        className="broadcast-cta inline-flex items-center justify-center"
        style={{
          marginTop: 28,
          gap: 10,
          background: "linear-gradient(135deg, #f5a623 0%, #e8941a 60%, #d4820f 100%)",
          color: "#000",
          fontFamily: "Bebas Neue, var(--font-display)",
          fontSize: 18,
          letterSpacing: "0.1em",
          padding: "16px 48px",
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(245,166,35,0.4)",
          transition: "all 180ms ease",
        }}
      >
        ⚽ SIMULATE THE TOURNAMENT NOW
      </Link>

      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
        .broadcast-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(245,166,35,0.6);
        }
      `}</style>
    </div>
  );
}

function PhasePost() {
  return (
    <div className="text-center relative py-6">
      <div className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,166,35,0.2), transparent 60%)" }} />
      <div className="text-7xl sm:text-8xl">{CHAMPION.flag || "🏆"}</div>
      <h2 style={{ fontFamily: "Bebas Neue, var(--font-display)", color: "#f5a623" }}
        className="text-[36px] sm:text-[56px] mt-2">{CHAMPION.name || "TBD"}</h2>
      <p style={{ fontFamily: "Bebas Neue, var(--font-display)", letterSpacing: "0.12em" }}
        className="text-white text-2xl mt-1">FIFA WORLD CHAMPIONS 2026</p>
      <p className="text-[13px] text-[#8899aa] mt-2">{CHAMPION.date}</p>
    </div>
  );
}

export function TournamentStatus() {
  const [phase, setPhase] = useState(() => getPhase());
  useEffect(() => { setPhase(getPhase()); }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: 520 }}
    >
      {phase === "pre" && <PitchBackground />}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative flex items-center justify-center py-10 sm:py-12"
        style={{ minHeight: 520 }}
      >
        {phase === "pre" && <PhaseCountdown />}
        {phase === "live" && <TodayMatches />}
        {phase === "post" && <PhasePost />}
      </motion.div>
    </section>
  );
}
