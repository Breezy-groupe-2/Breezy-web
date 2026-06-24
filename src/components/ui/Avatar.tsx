const GRADIENTS: [string, string][] = [
  ["oklch(0.72 0.18 152)", "oklch(0.62 0.22 180)"],
  ["oklch(0.70 0.18 260)", "oklch(0.62 0.20 300)"],
  ["oklch(0.72 0.18 30)",  "oklch(0.65 0.18 60)"],
  ["oklch(0.70 0.16 200)", "oklch(0.62 0.18 240)"],
  ["oklch(0.72 0.16 90)",  "oklch(0.64 0.18 130)"],
  ["oklch(0.68 0.18 340)", "oklch(0.60 0.20 20)"],
];

function gradientFor(name: string): [string, string] {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

interface AvatarProps {
  src?: string | null;
  displayName: string;
  size?: number;
  ring?: boolean;
  className?: string;
}

export function Avatar({
  src,
  displayName,
  size = 44,
  ring = false,
  className = "",
}: AvatarProps) {
  const label = (displayName ?? "").trim();
  // First letter of the handle/name, or "?" when there is nothing to show.
  const initial = label ? [...label][0].toUpperCase() : "?";
  const [from, to] = gradientFor(label);

  return (
    <div
      className={`relative shrink-0 overflow-hidden flex items-center justify-center font-bold text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "var(--r-avatar)",
        background: `linear-gradient(140deg, ${from}, ${to})`,
        fontSize: size * 0.42,
        fontFamily: "var(--font-display)",
        letterSpacing: "-0.02em",
        boxShadow: ring
          ? "0 0 0 3px var(--surface), 0 0 0 5px var(--primary-soft)"
          : undefined,
      }}
    >
      {/* A profile photo is optional. When set (any URL), show it; otherwise the
          gradient + initial below shows through. Plain <img> avoids next/image's
          per-host allowlist so users can point at any image URL. */}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={displayName}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      ) : (
        initial
      )}
    </div>
  );
}
