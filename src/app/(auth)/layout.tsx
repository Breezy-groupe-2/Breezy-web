import type { ReactNode } from "react";
import { BreezyLogo } from "@/components/ui";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Brand panel — desktop only */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-ink px-12 py-12 shrink-0">
        <BreezyLogo iconSize={40} textSize="text-[22px]" dark />
        <p className="text-[36px] font-extrabold text-white leading-[1.2] tracking-tight">
          Ce qui compte,<br />
          <em className="not-italic text-white/50">partagé simplement.</em>
        </p>
        <p className="text-[13px] text-white/40">© 2026 Breezy · Tous droits réservés</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-8 md:px-12">
        <div className="w-full max-w-[360px]">{children}</div>
      </div>
    </div>
  );
}
