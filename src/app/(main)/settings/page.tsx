"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { useTheme } from "@/store/theme-context";
import { useAuth } from "@/hooks/use-auth";

type ThemeOption = "light" | "dark";

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: "sun" | "moon"; preview: string }[] = [
  { value: "light", label: "Clair",  icon: "sun",  preview: "bg-white border-gray-200" },
  { value: "dark",  label: "Sombre", icon: "moon", preview: "bg-gray-900 border-gray-700" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  function handleThemeSelect(value: ThemeOption) {
    if (value !== theme) toggleTheme();
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex flex-col min-h-svh">
      {/* Header */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 pt-[54px] md:pt-3"
        style={{
          background: "color-mix(in oklch, var(--bg) 82%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-[42px] h-[42px] flex items-center justify-center rounded-full"
          style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
        >
          <Icon name="back" size={20} color="var(--text)" />
        </button>
        <span className="font-display font-bold text-[19px]" style={{ color: "var(--text)" }}>
          Paramètres
        </span>
      </div>

      <div className="flex-1 px-5 py-4 pb-[120px] space-y-7 max-w-[600px] mx-auto w-full">

        {/* Account section */}
        <section>
          <h2 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
            Compte
          </h2>
          <div
            className="rounded-[18px] overflow-hidden divide-y"
            style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Icon name="mail" size={20} color="var(--text-muted)" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>Email</p>
                <p className="text-[13px] truncate" style={{ color: "var(--text-faint)" }}>{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Icon name="user" size={20} color="var(--text-muted)" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>Nom d&apos;utilisateur</p>
                <p className="text-[13px]" style={{ color: "var(--text-faint)" }}>@{user?.username}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance section */}
        <section>
          <h2 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
            Apparence
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map(({ value, label, icon }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  onClick={() => handleThemeSelect(value)}
                  className="flex flex-col items-center gap-3 p-5 rounded-[18px] transition-all"
                  style={{
                    background: "var(--surface)",
                    boxShadow: active
                      ? `inset 0 0 0 2px var(--primary), var(--card-shadow)`
                      : `inset 0 0 0 1.5px var(--border), var(--card-shadow)`,
                  }}
                >
                  {/* Mini preview */}
                  <div
                    className={`w-full h-14 rounded-[12px] flex items-center justify-center border-[1.5px] ${value === "light" ? "bg-white border-gray-200" : "bg-gray-950 border-gray-800"}`}
                  >
                    <div className={`w-8 h-1.5 rounded-full ${value === "light" ? "bg-gray-200" : "bg-gray-700"}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name={icon} size={16} color={active ? "var(--primary)" : "var(--text-muted)"} />
                    <span
                      className="text-[14px] font-semibold"
                      style={{ color: active ? "var(--primary)" : "var(--text)" }}
                    >
                      {label}
                    </span>
                    {active && (
                      <Icon name="check" size={14} color="var(--primary)" stroke={2.5} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
            Session
          </h2>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] transition-opacity hover:opacity-80"
            style={{
              background: "var(--surface)",
              boxShadow: "inset 0 0 0 1.5px var(--like), var(--card-shadow)",
            }}
          >
            <Icon name="back" size={20} color="var(--like)" />
            <span className="text-[14px] font-bold" style={{ color: "var(--like)" }}>
              Se déconnecter
            </span>
          </button>
        </section>
      </div>
    </div>
  );
}
