import { Icon } from "./Icon";

interface BreezyLogoProps {
  size?: number;
}

export function BreezyLogo({ size = 23 }: BreezyLogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          background: "var(--primary)",
          transform: "rotate(-4deg)",
        }}
      >
        <Icon name="gust" size={19} color="var(--on-primary)" stroke={2.1} />
      </div>
      <span
        className="font-display font-extrabold tracking-tight"
        style={{ fontSize: size, color: "var(--text)", letterSpacing: "-0.03em" }}
      >
        breezy
      </span>
    </div>
  );
}
