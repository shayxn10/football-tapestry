import { flag } from "@/data/wcData";

export function Flag({ code, size = 20, className = "" }: { code: string; size?: number; className?: string }) {
  return (
    <img
      src={flag(code)}
      alt=""
      width={size}
      height={Math.round(size * 0.75)}
      loading="lazy"
      className={`inline-block rounded-sm object-cover ring-1 ring-border/60 ${className}`}
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}
