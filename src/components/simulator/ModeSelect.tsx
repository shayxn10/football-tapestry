import { motion } from "framer-motion";
import groupsImg from "@/assets/wc2026-groups.png";
import { SimulatorLeaderboard } from "@/components/simulator/SimulatorLeaderboard";

interface Props {
  onSelect: (mode: "full" | "journey") => void;
}

export function ModeSelect({ onSelect }: Props) {
  return (
    <div className="relative min-h-[calc(100vh-220px)] flex items-center justify-center px-4 sm:px-6 py-12 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={groupsImg} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center"
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent mb-3">
          ⚽ World Cup Simulator 2026
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-4">
          How do you want to<br />experience the tournament?
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-sm sm:text-base">
          Pick a mode. You can reset at any time and start over.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            {
              id: "full" as const,
              icon: "🏆",
              title: "Full Tournament",
              desc: "Simulate every match yourself, from Group Stage through to the Final.",
              accent: "var(--accent)",
              ctaLabel: "Start full tournament",
            },
            {
              id: "journey" as const,
              icon: "🎯",
              title: "Team Journey",
              desc: "Pick one nation. You simulate their matches — the rest run automatically.",
              accent: "var(--pitch)",
              ctaLabel: "Choose your team",
            },
          ].map(card => (
            <motion.button
              key={card.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(card.id)}
              className="group text-left bg-card/80 backdrop-blur-md border border-border/70 hover:border-foreground/60 rounded-2xl p-6 sm:p-7 transition-all"
              style={{ boxShadow: `0 0 0 1px transparent` }}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-lg text-2xl mb-4"
                style={{ background: `color-mix(in oklab, ${card.accent} 18%, transparent)`, color: card.accent }}
              >
                {card.icon}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{card.desc}</p>
              <span
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: card.accent }}
              >
                {card.ctaLabel} <span aria-hidden>→</span>
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
