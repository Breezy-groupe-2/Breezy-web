"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Icon } from "@/components/ui";

export default function SuspendedPage() {
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div
      className="min-h-svh flex flex-col items-center justify-center px-8 text-center"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full mb-6"
        style={{ background: "color-mix(in oklch, var(--like) 15%, transparent)" }}
      >
        <Icon name="lock" size={28} color="var(--like)" />
      </div>
      <h1
        className="font-display font-extrabold text-[26px] mb-2"
        style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
      >
        Compte suspendu
      </h1>
      <p className="text-[15px] max-w-[340px] mb-8" style={{ color: "var(--text-muted)" }}>
        Ton compte a été suspendu par un administrateur. Contacte le support si tu penses qu&apos;il s&apos;agit d&apos;une erreur.
      </p>
      <button
        onClick={handleLogout}
        className="h-11 px-8 rounded-full text-[15px] font-bold"
        style={{ background: "var(--primary)", color: "var(--on-primary)" }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
