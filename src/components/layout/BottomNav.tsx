"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/home",
    label: "Accueil",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="size-[22px]" fill={active ? "#0A0A0A" : "none"} stroke={active ? "none" : "#ADADAD"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
      </svg>
    ),
  },
  {
    href: "/explore",
    label: "Explorer",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke={active ? "#0A0A0A" : "#ADADAD"} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Notifs",
    hasNotif: true,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke={active ? "#0A0A0A" : "#ADADAD"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/profile/me",
    label: "Profil",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="size-[22px]" fill={active ? "#0A0A0A" : "none"} stroke={active ? "none" : "#ADADAD"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 h-[60px] bg-white border-t border-line flex items-center md:hidden">
      {navItems.map(({ href, label, icon, hasNotif }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center gap-[3px] flex-1 py-[6px]"
          >
            {hasNotif && !active && (
              <span className="absolute top-[7px] right-[calc(50%-8px)] size-[6px] rounded-full bg-ink border-2 border-white" />
            )}
            {icon(active)}
            <span className={["text-[10px] font-medium", active ? "text-ink font-bold" : "text-muted"].join(" ")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
