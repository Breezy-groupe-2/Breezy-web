"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BreezyLogo, Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  {
    href: "/home",
    label: "Accueil",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="size-[22px] shrink-0" fill={active ? "#0A0A0A" : "none"} stroke="#0A0A0A" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
      </svg>
    ),
  },
  {
    href: "/explore",
    label: "Explorer",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="size-[22px] shrink-0" fill="none" stroke={active ? "#0A0A0A" : "#6B6B6B"} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Notifications",
    hasNotif: true,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="size-[22px] shrink-0" fill="none" stroke={active ? "#0A0A0A" : "#6B6B6B"} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/profile/me",
    label: "Profil",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="size-[22px] shrink-0" fill={active ? "#0A0A0A" : "none"} stroke={active ? "none" : "#6B6B6B"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-[240px] border-r border-line bg-white px-4 py-6 shrink-0 sticky top-0 h-screen">
      {/* Logo */}
      <Link href="/home" className="px-2 mb-8">
        <BreezyLogo iconSize={30} textSize="text-[18px]" />
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-[2px] flex-1">
        {navItems.map(({ href, label, icon, hasNotif }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "relative flex items-center gap-[14px] px-[14px] py-[11px] rounded-[10px] text-[16px] transition-colors",
                active
                  ? "bg-surface font-bold text-ink"
                  : "font-medium text-sub hover:bg-surface",
              ].join(" ")}
            >
              {hasNotif && !active && (
                <span className="absolute top-2 left-[28px] size-[7px] rounded-full bg-ink border-2 border-white" />
              )}
              {icon(active)}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Compose button */}
      <button className="mt-4 w-full h-[46px] bg-ink text-white rounded-full text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-black/90 transition-colors cursor-pointer">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Poster
      </button>

      {/* User card */}
      <div className="mt-2 flex items-center gap-[10px] px-[10px] py-3 rounded-[10px] hover:bg-surface cursor-pointer transition-colors">
        <Avatar
          alt={user?.displayName ?? "A"}
          src={user?.avatarUrl}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-ink truncate">
            {user?.displayName ?? "Alex Martin"}
          </p>
          <p className="text-[12px] text-sub truncate">
            @{user?.username ?? "alexmartin"}
          </p>
        </div>
        <svg viewBox="0 0 24 24" className="size-4 text-sub shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="19" cy="12" r="1" fill="currentColor" />
          <circle cx="5" cy="12" r="1" fill="currentColor" />
        </svg>
      </div>
    </aside>
  );
}
