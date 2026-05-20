import { teamCode } from "@/data/wc2026Fixtures";

export function TeamFlag({ name, size = 28, className = "" }: { name: string; size?: number; className?: string }) {
  const code = teamCode(name);
  if (!code) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-muted/40 border border-border rounded-sm text-[8px] font-mono uppercase ${className}`}
        style={{ width: size, height: size * 0.7 }}
        aria-label={name}
      >
        ?
      </div>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={`${name} flag`}
      width={size}
      height={Math.round(size * 0.7)}
      className={`inline-block rounded-sm object-cover ring-1 ring-border/40 ${className}`}
      loading="lazy"
    />
  );
}
