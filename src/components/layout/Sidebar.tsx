"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BreezyLogo, Avatar } from "@/components/ui";
import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { useCompose } from "@/store/compose-context";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: IconName;
  iconFill?: IconName;
}[] = [
  { href: "/home",       label: "Accueil",    icon: "home",   iconFill: "homeFill" },
  { href: "/search",     label: "Découvrir",  icon: "search" },
  { href: "/activity",   label: "Activité",   icon: "bell",   iconFill: "bellFill" },
  { href: "/profile/me", label: "Profil",     icon: "user" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { openCompose } = useCompose();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.replace("/login");
  }

  return (
    <aside className="hidden md:flex flex-col w-[270px] shrink-0 sticky top-0 h-screen px-4 py-6 border-r overflow-y-auto" style={{ borderColor: "var(--border)" }}>
      <Link href="/home" className="px-3 mb-6">
        <BreezyLogo size={22} />
      </Link>

      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ href, label, icon, iconFill }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-[14px] text-[16px] transition-colors"
              style={{
                color: active ? "var(--primary)" : "var(--text)",
                background: active ? "var(--primary-soft)" : "transparent",
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon
                name={active && iconFill ? iconFill : icon}
                size={22}
                color={active ? "var(--primary)" : "var(--text)"}
                stroke={active ? 2.1 : 1.9}
              />
              {label}
            </Link>
          );
        })}
        {user?.isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-3 rounded-[14px] text-[16px] transition-colors"
            style={{
              color: pathname.startsWith("/admin") ? "var(--primary)" : "var(--text)",
              background: pathname.startsWith("/admin") ? "var(--primary-soft)" : "transparent",
              fontWeight: pathname.startsWith("/admin") ? 700 : 500,
            }}
          >
            <Icon name="shield" size={22} color={pathname.startsWith("/admin") ? "var(--primary)" : "var(--text)"} />
            Modération
          </Link>
        )}
      </nav>

      <button
        onClick={openCompose}
        className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-full text-[15px] font-bold transition-opacity hover:opacity-90"
        style={{ background: "var(--primary)", color: "var(--on-primary)" }}
      >
        <Icon name="feather" size={18} color="var(--on-primary)" stroke={2} />
        Composer
      </button>

      {/* User card + logout menu */}
      <div className="relative mt-2" ref={menuRef}>
        {menuOpen && (
          <div
            className="absolute bottom-full left-0 mb-2 w-full border rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Déconnexion
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-full flex items-center gap-[10px] px-[10px] py-3 rounded-[10px] transition-colors cursor-pointer"
          style={{ background: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Avatar
            displayName={user?.displayName ?? ""}
            src={user?.avatarUrl}
            size={36}
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[14px] font-bold truncate" style={{ color: "var(--text)" }}>
              {user?.displayName ?? ""}
            </p>
            <p className="text-[12px] truncate" style={{ color: "var(--text-faint)" }}>
              @{user?.username ?? ""}
            </p>
          </div>
          <Icon name="more" size={18} color="var(--text-faint)" />
        </button>
      </div>
    </aside>
  );
}
