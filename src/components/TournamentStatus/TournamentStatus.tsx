import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { TodayMatches } from "@/components/TodayMatches/TodayMatches";

const TOURNAMENT_START = new Date("2026-06-11T15:00:00-06:00");
const TOURNAMENT_END = new Date("2026-07-19T23:59:59-04:00");

const CHAMPION = { name: "", flag: "", date: "July 19, 2026 · New York / New Jersey" };

function getPhase(now = new Date()) {
  if (now < TOURNAMENT_START) return "pre" as const;
  if (now > TOURNAMENT_END) return "post" as const;
  return "live" as const;
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-[88px] sm:min-w-[120px] rounded-lg px-4 py-4 sm:px-6 sm:py-5"
      style={{ background: "#111827", border: "1px solid #1f2d45" }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ scale: 1.1, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          style={{ fontFamily: "Bebas Neue, var(--font-display)", color: "#f5a623", lineHeight: 1 }}
          className="text-4xl sm:text-6xl tabular-nums"
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
      <span className="mt-2 text-[10px] sm:text-[11px] text-[#8899aa]"
        style={{ letterSpacing: "0.15em", fontFamily: "var(--font-display)" }}>{label}</span>
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
    <div className="text-center">
      <h3 style={{ fontFamily: "Bebas Neue, var(--font-display)", color: "#8899aa", letterSpacing: "0.06em" }}
        className="text-[22px] sm:text-[32px] mb-6">THE WAIT IS ALMOST OVER</h3>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <CountdownBox value={d} label="DAYS" />
        <CountdownBox value={h} label="HOURS" />
        <CountdownBox value={m} label="MINUTES" />
        <CountdownBox value={s} label="SECONDS" />
      </div>
      <div className="mt-7 space-y-1">
        <p className="text-[13px] text-[#8899aa]">OPENING MATCH · JUNE 11 2026 · 15:00 EST</p>
        <p className="text-[16px] text-[#f0f4ff]">🇲🇽 Mexico vs South Africa 🇿🇦</p>
        <p className="text-[12px] text-[#445566]">Estadio Azteca · Mexico City</p>
      </div>
      <Link to="/simulator"
        className="inline-flex items-center justify-center mt-6 hover:brightness-110 transition"
        style={{
          background: "#f5a623", color: "#000",
          fontFamily: "Bebas Neue, var(--font-display)",
          letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, fontSize: 16,
        }}>
        ⚽ Simulate the Tournament Now
      </Link>
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
    <section className="rounded-2xl p-6 sm:p-10"
      style={{ minHeight: 280, background: "rgba(7,11,20,0.6)", border: "1px solid #1f2d45" }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ minHeight: 280 }} className="flex items-center justify-center">
        {phase === "pre" && <PhaseCountdown />}
        {phase === "live" && <TodayMatches />}
        {phase === "post" && <PhasePost />}
      </motion.div>
    </section>
  );
}
