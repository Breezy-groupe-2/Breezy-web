"use client";

const TABS = [
  { key: "mine", label: "Mon feed" },
  { key: "all",  label: "Général" },
] as const;

type FeedTab = "mine" | "all";

interface FeedSwitchProps {
  value: FeedTab;
  onChange: (tab: FeedTab) => void;
}

export function FeedSwitch({ value, onChange }: FeedSwitchProps) {
  const idx = value === "mine" ? 0 : 1;

  return (
    <div>
      <div
        className="relative flex max-w-[280px] mx-auto p-1 rounded-full"
        style={{ background: "var(--surface-2)" }}
      >
        {/* Sliding thumb */}
        <div
          className="absolute top-1 bottom-1 rounded-full transition-all duration-[240ms]"
          style={{
            width: "calc(50% - 4px)",
            left: `calc(4px + ${idx} * (50% - 4px))`,
            background: "var(--surface)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          }}
        />
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="relative z-[1] flex-1 h-[34px] text-[14px] font-bold transition-colors duration-200"
            style={{ color: value === key ? "var(--primary)" : "var(--text-muted)" }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
