"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Icon } from "@/components/ui";
import { PostCard } from "@/features/posts/PostCard";
import { getProfile, updateProfile } from "@/features/profile/profile.api";
import {
  getUserPosts,
  createPost,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
} from "@/features/posts/posts.api";
import { useAuth } from "@/hooks/use-auth";
import { useFollow } from "@/store/follow-context";
import { useCompose } from "@/store/compose-context";
import type { User, Post } from "@/types";

type Tab = "posts" | "media" | "likes";

export function ProfileView() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user: me } = useAuth();

  const resolvedUsername = username === "me" ? me?.username ?? "" : username;
  const isMe = resolvedUsername === me?.username;

  const { isFollowing, toggle, ready: followReady } = useFollow();
  const { registerHandler } = useCompose();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<Tab>("posts");
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!resolvedUsername) return;
    Promise.all([
      getProfile(resolvedUsername),
      getUserPosts(resolvedUsername),
    ])
      .then(([prof, userPosts]) => {
        setProfile(prof);
        setPosts(userPosts);
        setEditName(prof.displayName);
        setEditBio(prof.bio ?? "");
        setEditAvatar(prof.avatarUrl ?? "");
      })
      .finally(() => setLoading(false));
  }, [resolvedUsername]);

  // Live follower-count sync: follow state is owned by FollowContext (shared with
  // the suggestions rail), so following from anywhere must move this counter.
  const followed = profile && !isMe ? isFollowing(profile.username) : false;
  const baselineFollowedRef = useRef<boolean | null>(null);

  useEffect(() => {
    baselineFollowedRef.current = null;
  }, [resolvedUsername]);

  useEffect(() => {
    if (!profile || isMe || !followReady) return;
    if (baselineFollowedRef.current === null) {
      baselineFollowedRef.current = followed;
      return;
    }
    if (baselineFollowedRef.current !== followed) {
      baselineFollowedRef.current = followed;
      setProfile((p) =>
        p ? { ...p, followersCount: Math.max(0, p.followersCount + (followed ? 1 : -1)) } : p
      );
    }
  }, [followed, followReady, isMe, profile, resolvedUsername]);

  function handleLike(id: string) {
    const target = posts.find((p) => p.id === id);
    if (!target) return;
    const wasLiked = target.isLiked;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !wasLiked, likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
    const rollback = () =>
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, isLiked: wasLiked, likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1 }
            : p
        )
      );
    (wasLiked ? unlikePost : likePost)(id).catch(rollback);
  }

  // New posts created from the global composer should appear instantly when the
  // author is viewing their own profile.
  const handlePost = useCallback(
    async (content: string, mediaUrl?: string) => {
      const created = await createPost(content, mediaUrl);
      if (isMe) setPosts((prev) => [created, ...prev]);
    },
    [isMe]
  );

  useEffect(() => {
    if (!isMe) return;
    registerHandler(handlePost);
  }, [isMe, registerHandler, handlePost]);

  function handleDelete(id: string) {
    const snapshot = posts;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    deletePost(id).catch(() => setPosts(snapshot));
  }

  async function handleUpdate(id: string, newContent: string) {
    const updated = await updatePost(id, newContent);
    setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  function handleShare() {
    setMenuOpen(false);
    const url = `${window.location.origin}/profile/${profile?.username}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  }

  function handleReport() {
    setMenuOpen(false);
    setShareToast(false);
    window.alert("Signalement transmis à la modération. Merci.");
  }

  async function saveProfile() {
    const updated = await updateProfile({
      displayName: editName,
      bio: editBio,
      avatarUrl: editAvatar.trim(),
    });
    setProfile(updated);
    setEditOpen(false);
  }

  if (loading || !profile) {
    return (
      <div className="flex justify-center py-16">
        <span className="w-8 h-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin block" />
      </div>
    );
  }

  const GRADIENTS: [string, string][] = [
    ["oklch(0.72 0.18 152)", "oklch(0.62 0.22 180)"],
    ["oklch(0.70 0.18 260)", "oklch(0.62 0.20 300)"],
    ["oklch(0.72 0.18 30)", "oklch(0.65 0.18 60)"],
    ["oklch(0.70 0.16 200)", "oklch(0.62 0.18 240)"],
    ["oklch(0.72 0.16 90)", "oklch(0.64 0.18 130)"],
  ];
  const hash = profile.displayName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const [bannerFrom, bannerTo] = GRADIENTS[hash % GRADIENTS.length];

  const TABS: { key: Tab; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "media", label: "Médias" },
    { key: "likes", label: "Likes" },
  ];

  return (
    <div className="flex flex-col scrollbar-hide overflow-y-auto min-h-svh">
      {/* Banner */}
      <div
        className="relative h-[150px] shrink-0"
        style={{
          background: `linear-gradient(140deg, ${bannerFrom}, ${bannerTo})`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 20% 0%, rgba(255,255,255,0.25), transparent 60%)",
          }}
        />
        {/* Back button */}
        <div className="absolute top-14 left-4 right-4 flex justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{
              background: "rgba(0,0,0,0.22)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Icon name="back" size={20} color="white" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{
                background: "rgba(0,0,0,0.22)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Icon name="more" size={20} color="white" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden z-50 py-1"
                style={{
                  background: "var(--surface)",
                  boxShadow: "var(--card-shadow)",
                  border: "1px solid var(--border)",
                }}
              >
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[14.5px] font-semibold text-left"
                  style={{ color: "var(--text)" }}
                >
                  <Icon name="share" size={17} color="var(--text-muted)" />
                  Partager le profil
                </button>
                {!isMe && (
                  <button
                    onClick={handleReport}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[14.5px] font-semibold text-left"
                    style={{ color: "var(--like)" }}
                  >
                    <Icon name="flag" size={17} color="var(--like)" />
                    Signaler @{profile.username}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {shareToast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[70] px-4 py-2.5 rounded-full text-[14px] font-bold"
          style={{
            background: "var(--text)",
            color: "var(--bg)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          Lien du profil copié
        </div>
      )}

      {/* Profile header */}
      <div className="px-5">
        <div className="flex justify-between items-end -mt-9">
          <div
            style={{ boxShadow: "0 0 0 4px var(--bg)", borderRadius: "var(--r-avatar)" }}
          >
            <Avatar displayName={profile.displayName} src={profile.avatarUrl} size={84} />
          </div>
          <div className="mb-1">
            {isMe ? (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-full text-[14px] font-bold border"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <Icon name="edit" size={15} />
                Modifier
              </button>
            ) : (
              <button
                onClick={() => toggle(profile.username)}
                className="h-9 px-5 rounded-full text-[14px] font-bold transition-colors"
                style={
                  followed
                    ? { background: "var(--surface-2)", color: "var(--text)" }
                    : { background: "var(--primary)", color: "var(--on-primary)" }
                }
              >
                {followed ? "Abonné·e" : "Suivre"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="font-display font-extrabold text-[22px] tracking-tight"
              style={{ color: "var(--text)", letterSpacing: "-0.01em" }}
            >
              {profile.displayName}
            </h1>
            {profile.status === "suspended" && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "color-mix(in oklch, oklch(0.78 0.13 90) 18%, transparent)",
                  color: "oklch(0.78 0.13 90)",
                }}
              >
                Suspendu
              </span>
            )}
            {profile.status === "banned" && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "color-mix(in oklch, var(--like) 18%, transparent)",
                  color: "var(--like)",
                }}
              >
                Banni
              </span>
            )}
          </div>
          <p className="text-[14.5px] mt-0.5" style={{ color: "var(--text-faint)" }}>
            @{profile.username}
          </p>
          {profile.bio && (
            <p
              className="text-[15px] leading-relaxed mt-3"
              style={{ color: "var(--text)", textWrap: "pretty" } as React.CSSProperties}
            >
              {profile.bio}
            </p>
          )}
          <div className="flex gap-5 mt-3">
            <span className="text-[14px]" style={{ color: "var(--text-muted)" }}>
              <b
                className="font-display font-bold"
                style={{ color: "var(--text)" }}
              >
                {profile.followingCount.toLocaleString("fr")}
              </b>{" "}
              abonnements
            </span>
            <span className="text-[14px]" style={{ color: "var(--text-muted)" }}>
              <b
                className="font-display font-bold"
                style={{ color: "var(--text)" }}
              >
                {profile.followersCount.toLocaleString("fr")}
              </b>{" "}
              abonnés
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1.5 mt-5 p-1 rounded-full"
          style={{ background: "var(--surface-2)" }}
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 h-9 rounded-full text-[14px] font-bold transition-all duration-200"
              style={
                tab === key
                  ? { background: "var(--primary)", color: "var(--on-primary)" }
                  : { color: "var(--text-muted)" }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-3 p-3.5 mt-3 pb-[120px] md:pb-8">
        {tab === "posts" &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwn={post.author.username === me?.username}
              onLike={handleLike}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        {tab !== "posts" && (
          <p
            className="text-center text-[14px] py-14"
            style={{ color: "var(--text-faint)" }}
          >
            Rien à montrer ici pour l&apos;instant.
          </p>
        )}
      </div>

      {/* Edit profile sheet */}
      {editOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(20,16,40,0.45)" }}
            onClick={() => setEditOpen(false)}
          />
          <div
            className="relative"
            style={{
              background: "var(--bg)",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              animation: "b-sheet-in 0.32s cubic-bezier(.3,.8,.3,1) both",
            }}
          >
            <div className="w-10 h-1.5 rounded-full mx-auto mt-2.5" style={{ background: "var(--border)" }} />
            <div className="flex items-center justify-between px-5 py-3">
              <button
                onClick={() => setEditOpen(false)}
                className="text-[15.5px] font-bold"
                style={{ color: "var(--text-muted)" }}
              >
                Annuler
              </button>
              <span className="font-display font-bold text-[16px]" style={{ color: "var(--text)" }}>
                Modifier le profil
              </span>
              <button
                onClick={saveProfile}
                className="text-[15.5px] font-extrabold"
                style={{ color: "var(--primary)" }}
              >
                OK
              </button>
            </div>
            <div className="flex justify-center py-4">
              <div className="relative">
                <Avatar displayName={editName || profile.displayName} src={editAvatar.trim() || null} size={84} />
                <div
                  className="absolute -right-1 -bottom-1 w-8 h-8 flex items-center justify-center rounded-full"
                  style={{
                    background: "var(--primary)",
                    boxShadow: "0 0 0 3px var(--bg)",
                  }}
                >
                  <Icon name="image" size={16} color="var(--on-primary)" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 px-5 pb-10">
              <div>
                <label className="block text-[13.5px] font-bold mb-1.5 ml-1" style={{ color: "var(--text-muted)" }}>
                  Nom
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-[52px] px-4 rounded-[16px] border-none outline-none text-[15.5px]"
                  style={{
                    background: "var(--surface)",
                    boxShadow: "inset 0 0 0 1.5px var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>
              <div>
                <label className="block text-[13.5px] font-bold mb-1.5 ml-1" style={{ color: "var(--text-muted)" }}>
                  Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-[16px] border-none outline-none resize-none text-[15px] leading-snug font-sans"
                  style={{
                    background: "var(--surface)",
                    boxShadow: "inset 0 0 0 1.5px var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>
              <div>
                <label className="block text-[13.5px] font-bold mb-1.5 ml-1" style={{ color: "var(--text-muted)" }}>
                  Photo de profil (URL, optionnel)
                </label>
                <input
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://… (laisser vide = initiale)"
                  className="w-full h-[52px] px-4 rounded-[16px] border-none outline-none text-[15.5px]"
                  style={{
                    background: "var(--surface)",
                    boxShadow: "inset 0 0 0 1.5px var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
