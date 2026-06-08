"use client";

import Link from "next/link";
import { BreezyLogo, Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";

export function TopBar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-[52px] bg-white border-b border-line flex items-center justify-between px-4 md:hidden">
      <Link href="/home">
        <BreezyLogo iconSize={28} textSize="text-[17px]" />
      </Link>
      <Link href="/profile/me">
        <Avatar
          alt={user?.displayName ?? "A"}
          src={user?.avatarUrl}
          size="sm"
        />
      </Link>
    </header>
  );
}
