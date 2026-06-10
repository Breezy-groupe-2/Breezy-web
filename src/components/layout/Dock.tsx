"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { useCompose } from "@/store/compose-context";
import { useTheme } from "@/store/theme-context";

const NAV_ITEMS = [
  { key: "home",    href: "/home",             icon: "home"    as const, iconFill: "homeFill" as const },
  { key: "search",  href: "/search",            icon: "search"  as const },
  { key: "bell",    href: "/activity",          icon: "bell"    as const, iconFill: "bellFill" as const },
  { key: "profile", href: "/profile/me",        icon: "user"    as const },
];

export function Dock() {
  const pathname = usePathname();
  const { openCompose } = useCompose();
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center pb-6 pointer-events-none md:hidden"
      aria-label="Navigation principale"
    >
      <div
        className="pointer-events-auto flex items-center gap-1 px-3 py-2"
        style={{
          background: dark ? "rgba(44,40,60,0.72)" : "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "var(--r-pill)",
          boxShadow: "var(--dock-shadow)",
          border: dark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.8)",
        }}
      >
        {NAV_ITEMS.slice(0, 2).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.key} href={item.href}>
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full transition-colors"
                style={{ background: active ? "var(--primary-soft)" : "transparent" }}
              >
                <Icon
                  name={active && item.iconFill ? item.iconFill : item.icon}
                  size={24}
                  color={active ? "var(--primary)" : "var(--text-muted)"}
                  stroke={active ? 2.1 : 1.9}
                />
              </div>
            </Link>
          );
        })}

        {/* Compose button — center, elevated */}
        <button
          onClick={openCompose}
          className="mx-0.5 w-[50px] h-[50px] flex items-center justify-center rounded-full"
          style={{
            background: "var(--primary)",
            boxShadow:
              "0 4px 12px -2px color-mix(in oklch, var(--primary) 55%, transparent)",
          }}
          aria-label="Nouveau post"
        >
          <Icon name="feather" size={24} color="var(--on-primary)" stroke={2} />
        </button>

        {NAV_ITEMS.slice(2).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.key} href={item.href}>
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full transition-colors"
                style={{ background: active ? "var(--primary-soft)" : "transparent" }}
              >
                <Icon
                  name={active && item.iconFill ? item.iconFill : item.icon}
                  size={24}
                  color={active ? "var(--primary)" : "var(--text-muted)"}
                  stroke={active ? 2.1 : 1.9}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
