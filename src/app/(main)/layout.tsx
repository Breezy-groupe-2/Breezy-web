import type { ReactNode } from "react";
import { Sidebar, AuthGuard, Dock, RightRail } from "@/components/layout";
import { ComposeProvider } from "@/store/compose-context";
import { ComposeSheet } from "@/features/feed/ComposeSheet";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ComposeProvider>
        <div className="min-h-svh flex justify-center" style={{ background: "var(--bg)" }}>
          <div className="flex w-full max-w-[1260px]">
            <Sidebar />
            <main
              className="flex-1 flex flex-col min-h-svh max-w-[620px] border-x"
              style={{ borderColor: "var(--border)" }}
            >
              {children}
            </main>
            <RightRail />
          </div>
        </div>

        <Dock />
        <ComposeSheet />
      </ComposeProvider>
    </AuthGuard>
  );
}
