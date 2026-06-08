import type { ReactNode } from "react";
import { Sidebar, BottomNav, TopBar, AuthGuard } from "@/components/layout";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
    <div className="min-h-screen bg-canvas">
      {/* Mobile top bar */}
      <TopBar />

      <div className="flex justify-center">
        <div className="flex w-full max-w-[1100px]">
          {/* Desktop sidebar */}
          <Sidebar />

          {/* Center column */}
          <main className="flex-1 flex flex-col min-h-screen border-x border-line max-w-[600px] bg-canvas">
            {children}
          </main>

          {/* Right column — desktop */}
          <aside className="hidden lg:flex flex-col gap-5 w-[320px] shrink-0 px-5 py-4 sticky top-0 h-screen overflow-y-auto">
            {/* Search */}
            <div className="flex items-center gap-[10px] h-[42px] bg-surface rounded-full px-4">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="text-[14px] text-muted">Rechercher sur Breezy</span>
            </div>

            {/* Suggestions card */}
            <div className="border border-line rounded-[14px] overflow-hidden">
              <p className="px-4 pt-[14px] pb-[10px] text-[17px] font-extrabold text-ink tracking-tight">
                Suggestions
              </p>
              {[
                { name: "Marc Lefèvre", handle: "marcl" },
                { name: "Lena Kim", handle: "lenak" },
                { name: "Paul Renard", handle: "paulr" },
              ].map(({ name, handle }) => (
                <div key={handle} className="flex items-center gap-[10px] px-4 py-[10px] hover:bg-canvas cursor-pointer transition-colors">
                  <div className="size-[38px] rounded-full bg-ink flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-ink truncate">{name}</p>
                    <p className="text-[13px] text-sub truncate">@{handle}</p>
                  </div>
                  <button className="h-[30px] px-[14px] bg-ink text-white rounded-full text-[13px] font-bold shrink-0 hover:bg-black/90 transition-colors cursor-pointer">
                    Suivre
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Mobile bottom spacer */}
      <div className="h-[60px] md:hidden" />
    </div>
    </AuthGuard>
  );
}
