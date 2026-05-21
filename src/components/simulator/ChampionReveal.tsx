import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { TEAM_CODES } from "@/utils/teamCodes";
import trophyImg from "/assets/trophy.png?url";

interface Props {
  champion: string;
  isUserTeam?: boolean;
  onDismiss: () => void;
}

export function ChampionReveal({ champion, isUserTeam, onDismiss }: Props) {
  const fired = useRef(false);
  const meta = TEAM_CODES[champion] ?? { code: champion.slice(0, 3).toUpperCase(), flag: "🏆" };

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    // Confetti
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

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6"
      style={{ background: "#000" }}
    >
      {/* Trophy glow */}
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

      {/* Flag */}
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

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 4.0, duration: 0.3 }}
        onClick={onDismiss}
        className="absolute bottom-8 right-8 px-5 py-3 rounded text-sm text-white hover:bg-white/10"
        style={{ border: "1px solid #1f2d45", fontFamily: "var(--font-display)" }}
      >
        Continue →
      </motion.button>
    </motion.div>
  );
}
