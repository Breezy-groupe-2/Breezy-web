import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  title: string;
  text?: string;
  /** Optional icon shown in the rounded badge (defaults to a search glyph). */
  icon?: IconName;
  /** Optional call-to-action rendered under the text. */
  action?: ReactNode;
}

/**
 * Shared empty/zero-state block: a soft rounded icon badge, a title and an
 * optional description + action. Replaces the per-feature EmptyState/EmptyTab/
 * EmptyFeed copies.
 */
export function EmptyState({ title, text, icon = "search", action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 px-5 text-center">
      <div
        className="w-14 h-14 flex items-center justify-center rounded-[18px] mb-1"
        style={{ background: "var(--primary-soft)" }}
      >
        <Icon name={icon} size={26} color="var(--primary)" stroke={1.9} />
      </div>
      <h2
        className="font-display font-extrabold text-[21px] tracking-tight"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h2>
      {text && (
        <p className="text-[15px] leading-relaxed max-w-[280px]" style={{ color: "var(--text-muted)" }}>
          {text}
        </p>
      )}
      {action}
    </div>
  );
}
