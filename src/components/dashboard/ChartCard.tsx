import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  accent?: "pitch" | "magenta" | "cyan" | "amber";
  className?: string;
}

export function ChartCard({ title, subtitle, children, accent = "pitch", className = "" }: Props) {
  const accentVar = `var(--${accent})`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden ${className}`}
    >
      <div
        className="absolute top-0 left-0 h-px w-full opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${accentVar}, transparent)` }}
      />
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div
          className="h-2 w-2 rounded-full mt-2 flex-shrink-0"
          style={{ background: accentVar, boxShadow: `0 0 12px ${accentVar}` }}
        />
      </div>
      {children}
    </motion.div>
  );
}
