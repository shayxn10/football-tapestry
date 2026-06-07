import { motion } from "framer-motion";
import { insights, playerInsights } from "@/data/wcData";

const all = [
  ...insights.map(i => ({ ...i, scope: "Historical / Qatar 2022" })),
  ...playerInsights.map(i => ({ ...i, scope: "Qatar 2022 · Players" })),
];

export function Insights() {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p
            className="text-xs font-mono uppercase font-bold mb-3"
            style={{ letterSpacing: "0.2em", color: "#F47920" }}
          >
            05 — Analytical Findings · correlation, not causation
          </p>
          <h2
            className="text-3xl sm:text-[36px] font-black leading-[1.05]"
            style={{ letterSpacing: "-0.02em", color: "var(--color-text-1)" }}
          >
            Key Insights
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            All values below describe relationships between variables observed in the dataset.
            Correlation coefficients (<span className="font-mono">r</span>) are reported as comparative trends — they do not imply causation.
          </p>
        </div>
        <div className="text-xs font-mono text-muted-foreground hidden sm:block">{all.length.toString().padStart(2, "0")} / SIGNALS</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {all.map((ins, i) => (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass-card rounded-2xl p-6 relative group hover:-translate-y-1 transition-transform"
          >
            <div
              className="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-80"
              style={{ background: `var(--${ins.accent})` }}
            />
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{ins.icon}</div>
              <span
                className="text-xs font-mono px-2 py-1 rounded-md tabular-nums"
                style={{
                  background: `color-mix(in oklab, var(--${ins.accent}) 18%, transparent)`,
                  color: `var(--${ins.accent})`,
                }}
              >
                {ins.metric}
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-1 font-mono">{ins.scope}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{ins.title}</p>
            <h3 className="text-lg font-bold mb-3" style={{ color: `var(--${ins.accent})` }}>
              {ins.headline}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{ins.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
