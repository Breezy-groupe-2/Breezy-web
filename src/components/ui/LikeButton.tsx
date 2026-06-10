"use client";

import { useState } from "react";
import { Icon } from "./Icon";

interface Particle {
  id: number;
  dx: string;
  dy: string;
  color: string;
  size: number;
}

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  size?: number;
}

export function LikeButton({ liked, count, onToggle, size = 21 }: LikeButtonProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!liked) {
      const burst = Array.from({ length: 7 }, (_, i) => {
        const angle = (-90 + (i - 3) * 26) * (Math.PI / 180);
        const dist = 16 + Math.random() * 14;
        return {
          id: Math.random(),
          dx: `${Math.cos(angle) * dist}px`,
          dy: `${Math.sin(angle) * dist - 6}px`,
          color: Math.random() > 0.5 ? "var(--like)" : "var(--primary)",
          size: 4 + Math.random() * 3,
        };
      });
      setParticles(burst);
      setTimeout(() => setParticles([]), 650);
    }
    onToggle();
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 relative px-0.5 py-1 rounded-full transition-colors"
      style={{ color: liked ? "var(--like)" : "var(--text-faint)" }}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <span className="relative flex">
        <span
          key={liked ? "on" : "off"}
          style={{ animation: liked ? "b-pop 0.45s ease" : undefined, display: "flex" }}
        >
          <Icon
            name={liked ? "heartFill" : "heart"}
            size={size}
            color={liked ? "var(--like)" : "currentColor"}
            stroke={2}
          />
        </span>
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute pointer-events-none rounded-full"
            style={
              {
                left: "50%",
                top: "50%",
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                background: p.color,
                "--dx": p.dx,
                "--dy": p.dy,
                animation: "b-drift 0.6s cubic-bezier(.2,.8,.3,1) forwards",
              } as React.CSSProperties
            }
          />
        ))}
      </span>
      <span
        className="text-[13.5px] font-semibold min-w-[14px]"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {count}
      </span>
    </button>
  );
}
