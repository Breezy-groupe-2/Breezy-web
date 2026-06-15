"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Icon } from "@/components/ui";

const CONTENT = {
  suspended: {
    icon: "lock" as const,
    hue: 25,
    title: "Compte suspendu",
    body: "Ton compte a été temporairement suspendu par un administrateur. Contacte le support si tu penses qu’il s’agit d’une erreur.",
  },
  banned: {
    icon: "ban" as const,
    hue: 25,
    title: "Compte banni",
    body: "Ton compte a été définitivement banni de Breezy. Contacte le support si tu penses qu’il s’agit d’une erreur.",
  },
};

export default function SuspendedPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const status = user?.status === "banned" ? "banned" : "suspended";
  const { icon, hue, title, body } = CONTENT[status];

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
        style={{ background: `oklch(0.94 0.05 ${hue})` }}
      >
        <Icon name={icon} size={28} color={`oklch(0.55 0.18 ${hue})`} />
      </div>
      <h1
        className="font-display font-extrabold text-[26px] mb-2"
        style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
      >
        {title}
      </h1>
      <p className="text-[15px] max-w-[340px] mb-8" style={{ color: "var(--text-muted)" }}>
        {body}
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
