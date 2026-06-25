"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmptyState, Icon } from "@/components/ui";
import { UserRow } from "@/features/users/UserRow";
import { getFollowers, getFollowing } from "@/features/users/users.api";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/types";

type Tab = "followers" | "following";

export function FollowListView({ initialTab }: { initialTab: Tab }) {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user: me } = useAuth();

  const resolvedUsername = username === "me" ? me?.username ?? "" : username;

  const [tab, setTab] = useState<Tab>(initialTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resolvedUsername) return;
    let cancelled = false;
    Promise.all([getFollowers(resolvedUsername), getFollowing(resolvedUsername)])
      .then(([fl, fg]) => {
        if (cancelled) return;
        setFollowers(fl);
        setFollowing(fg);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [resolvedUsername]);

  const list = tab === "followers" ? followers : following;

  const TABS: { key: Tab; label: string }[] = [
    { key: "followers", label: "Abonnés" },
    { key: "following", label: "Abonnements" },
  ];

  return (
    <div className="flex flex-col min-h-svh scrollbar-hide overflow-y-auto">
      {/* Header */}
      <div
        className="sticky top-0 z-30 pt-[54px] md:pt-0"
        style={{
          background: "color-mix(in oklch, var(--bg) 82%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center gap-4 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full -ml-1"
            style={{ color: "var(--text)" }}
            aria-label="Retour"
          >
            <Icon name="back" size={20} color="var(--text)" />
          </button>
          <span className="font-display font-bold text-[17px]" style={{ color: "var(--text)" }}>
            @{resolvedUsername}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 h-12 text-[14.5px] font-bold relative"
              style={{ color: tab === key ? "var(--text)" : "var(--text-muted)" }}
            >
              {label}
              {tab === key && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-7 h-7 rounded-full border-[3px] border-primary border-t-transparent animate-spin block" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title={tab === "followers" ? "Aucun abonné" : "Aucun abonnement"}
          text={
            tab === "followers"
              ? "Personne ne suit ce profil pour l’instant."
              : "Ce profil ne suit personne pour l’instant."
          }
          icon="user"
        />
      ) : (
        <div className="flex flex-col py-1 pb-[120px] md:pb-8">
          {list.map((u) => (
            <UserRow key={u.username} user={u} showBio />
          ))}
        </div>
      )}
    </div>
  );
}
