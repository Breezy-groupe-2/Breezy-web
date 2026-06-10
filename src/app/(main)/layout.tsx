import type { ReactNode } from "react";
import { Sidebar, AuthGuard, Dock } from "@/components/layout";
import { ComposeProvider } from "@/store/compose-context";
import { ComposeSheet } from "@/features/feed/ComposeSheet";
import { Avatar } from "@/components/ui";

const SUGGESTIONS = [
  { name: "Lina Khoury",   handle: "lina.k",   avatar: "https://i.pravatar.cc/150?img=45", followed: true  },
  { name: "Sofia Nguyen",  handle: "sofia",     avatar: "https://i.pravatar.cc/150?img=49", followed: false },
  { name: "Samuel Roy",    handle: "samuel",    avatar: "https://i.pravatar.cc/150?img=15", followed: false },
  { name: "Hugo Petit",    handle: "hugo.bd",   avatar: "https://i.pravatar.cc/150?img=53", followed: false },
  { name: "Noah Berger",   handle: "noahcode",  avatar: "https://i.pravatar.cc/150?img=12", followed: true  },
];

const TENDANCES = [
  { category: "Design",  tag: "#interfacedouce", posts: "2 314" },
  { category: "Photo",   tag: "#argentique",     posts: "1 042" },
  { category: "Dev",     tag: "#vendreditech",   posts: "887"   },
  { category: "Vie",     tag: "#cafédumatin",    posts: "5 120" },
];

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ComposeProvider>
        <div className="min-h-svh flex justify-center" style={{ background: "var(--bg)" }}>
          <div className="flex w-full max-w-[1260px]">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Center column */}
            <main
              className="flex-1 flex flex-col min-h-svh max-w-[620px] border-x"
              style={{ borderColor: "var(--border)" }}
            >
              {children}
            </main>

            {/* Right rail — desktop only */}
            <aside className="hidden lg:flex flex-col gap-4 w-[360px] shrink-0 px-5 py-6 sticky top-0 max-h-screen overflow-y-auto self-start">
              {/* Search bar — white */}
              <div
                className="flex items-center gap-3 h-12 px-4 rounded-full"
                style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
              >
                <svg viewBox="0 0 24 24" className="size-[18px] shrink-0" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <span className="text-[15px]" style={{ color: "var(--text-faint)" }}>
                  Rechercher sur Breezy
                </span>
              </div>

              {/* Suggestions pour toi */}
              <div
                className="rounded-[20px] overflow-hidden"
                style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
              >
                <p className="px-5 pt-4 pb-2 font-display font-bold text-[17px]" style={{ color: "var(--text)" }}>
                  Suggestions pour toi
                </p>
                {SUGGESTIONS.map(({ name, handle, avatar, followed }) => (
                  <div
                    key={handle}
                    className="flex items-center gap-3 px-5 py-2.5"
                  >
                    <Avatar displayName={name} src={avatar} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold truncate" style={{ color: "var(--text)" }}>{name}</p>
                      <p className="text-[13px] truncate" style={{ color: "var(--text-faint)" }}>@{handle}</p>
                    </div>
                    <button
                      className="h-8 px-4 rounded-full text-[13px] font-bold transition-colors"
                      style={
                        followed
                          ? { background: "var(--surface-2)", color: "var(--text-muted)" }
                          : { background: "var(--primary-soft)", color: "var(--primary)" }
                      }
                    >
                      {followed ? "Suivi" : "Suivre"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Tendances */}
              <div
                className="rounded-[20px] overflow-hidden"
                style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
              >
                <p className="px-5 pt-4 pb-2 font-display font-bold text-[17px]" style={{ color: "var(--text)" }}>
                  Tendances
                </p>
                {TENDANCES.map(({ category, tag, posts }) => (
                  <div
                    key={tag}
                    className="px-5 py-3 cursor-pointer transition-colors hover:opacity-80"
                  >
                    <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>{category}</p>
                    <p className="text-[15px] font-bold" style={{ color: "var(--text)" }}>{tag}</p>
                    <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>{posts} posts</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <p className="px-1 text-[12px]" style={{ color: "var(--text-faint)" }}>
                Breezy · Conditions · Confidentialité · © 2026
              </p>
            </aside>
          </div>
        </div>

        {/* Mobile floating dock */}
        <Dock />

        {/* Global compose sheet */}
        <ComposeSheet />
      </ComposeProvider>
    </AuthGuard>
  );
}
