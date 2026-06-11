"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BreezyLogo, Avatar, Icon } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";

export function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuth();
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
    <header
      className="sticky top-0 z-30 h-[52px] flex items-center justify-between px-4 md:hidden border-b"
      style={{ background: "var(--bg)", borderColor: "var(--border)" }}
    >
      <Link href="/home">
        <BreezyLogo size={20} />
      </Link>

      <div className="flex items-center gap-2 ml-auto">
        {user?.isAdmin && (
          <Link
            href="/admin"
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: "var(--primary-soft)" }}
          >
            <Icon name="shieldFill" size={18} color="var(--primary)" stroke={2} />
          </Link>
        )}

      <div className="relative" ref={menuRef}>
        <button onClick={() => setMenuOpen((o) => !o)} className="cursor-pointer">
          <Avatar
            displayName={user?.displayName ?? ""}
            src={user?.avatarUrl}
            size={32}
          />
        </button>

        {menuOpen && (
          <div
            className="absolute top-full right-0 mt-2 w-[180px] border rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <Link
              href="/profile/me"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium transition-colors"
              style={{ color: "var(--text)" }}
            >
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Mon profil
            </Link>
            <div className="border-t" style={{ borderColor: "var(--border)" }} />
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
      </div>
      </div>
    </header>
  );
}
