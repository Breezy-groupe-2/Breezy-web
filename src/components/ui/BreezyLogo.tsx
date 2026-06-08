interface BreezyLogoProps {
  iconSize?: number;
  showText?: boolean;
  textSize?: string;
  iconClassName?: string;
  dark?: boolean;
}

export function BreezyLogo({
  iconSize = 30,
  showText = true,
  textSize = "text-[18px]",
  iconClassName = "",
  dark = false,
}: BreezyLogoProps) {
  const iconBg = dark ? "bg-white" : "bg-ink";
  const iconStroke = dark ? "#0A0A0A" : "#FFFFFF";
  const textColor = dark ? "text-white" : "text-ink";

  return (
    <div className="flex items-center gap-2">
      <div
        className={[
          "flex items-center justify-center rounded-[8px] shrink-0",
          iconBg,
          iconClassName,
        ].join(" ")}
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconStroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ width: iconSize * 0.57, height: iconSize * 0.57 }}
        >
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
      </div>
      {showText && (
        <span className={["font-extrabold tracking-tight", textSize, textColor].join(" ")}>
          Breezy
        </span>
      )}
    </div>
  );
}
