"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, Icon } from "@/components/ui";
import {
  getReports, dismissReport, deleteContent,
  getModAccounts, setAccountStatus,
} from "@/features/admin/admin.api";
import { useAuth } from "@/hooks/use-auth";
import type { ModAccount, Report, UserStatus } from "@/types";

// ── helpers ──────────────────────────────────────────────────────────────────

type Tab = "reports" | "accounts";
type AcctFilter = "all" | "active" | "suspended" | "banned";

const REASON_TONE: Record<string, { h: number; label: string }> = {
  Spam: { h: 40, label: "Spam" },
  "Harcèlement": { h: 25, label: "Harcèlement" },
  "Contenu inapproprié": { h: 320, label: "Inapproprié" },
  Désinformation: { h: 265, label: "Désinformation" },
};

const STATUS_TONE: Record<UserStatus, { h: number; label: string }> = {
  active:    { h: 152, label: "Actif" },
  suspended: { h: 70,  label: "Suspendu" },
  banned:    { h: 25,  label: "Banni" },
};

function modBtn(variant: "ghost" | "warn" | "danger" | "soft") {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: 38, padding: "0 14px", borderRadius: 999,
    fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", flex: 1,
    transition: "opacity 0.15s",
  };
  const variants: Record<string, React.CSSProperties> = {
    ghost:  { background: "var(--surface-2)", color: "var(--text)" },
    warn:   { background: "transparent", color: "oklch(0.58 0.15 40)", boxShadow: "inset 0 0 0 1.5px oklch(0.85 0.08 40)" },
    danger: { background: "transparent", color: "var(--like)", boxShadow: "inset 0 0 0 1.5px color-mix(in oklch, var(--like) 45%, transparent)" },
    soft:   { background: "var(--primary-soft)", color: "var(--primary)" },
  };
  return { ...base, ...variants[variant] };
}

// ── sub-components ────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed bottom-[90px] md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-[13.5px] font-semibold shadow-xl"
      style={{ background: "var(--text)", color: "var(--bg)", whiteSpace: "nowrap" }}
    >
      {message}
    </div>
  );
}

function ReasonBadge({ reason }: { reason: string }) {
  const t = REASON_TONE[reason] ?? { h: 25, label: reason };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold"
      style={{ background: `oklch(0.94 0.05 ${t.h})`, color: `oklch(0.5 0.15 ${t.h})` }}
    >
      <Icon name="flag" size={11} stroke={2.2} color="currentColor" />
      {t.label}
    </span>
  );
}

function StatusPill({ status }: { status: UserStatus }) {
  const s = STATUS_TONE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-bold"
      style={{ background: `oklch(0.95 0.04 ${s.h})`, color: `oklch(0.48 0.13 ${s.h})` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
      {s.label}
    </span>
  );
}

function StatTile({ icon, value, label, hue }: { icon: "flag" | "user" | "pause" | "ban"; value: number; label: string; hue: number }) {
  return (
    <div
      className="flex-1 rounded-[18px] p-4 flex flex-col gap-2.5"
      style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
    >
      <div
        className="w-9 h-9 rounded-[11px] flex items-center justify-center"
        style={{ background: `oklch(0.94 0.05 ${hue})`, color: `oklch(0.55 0.14 ${hue})` }}
      >
        <Icon name={icon} size={19} stroke={2} color="currentColor" />
      </div>
      <div>
        <div className="font-display font-extrabold text-[22px] leading-none tabular-nums" style={{ color: "var(--text)" }}>{value}</div>
        <div className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>{label}</div>
      </div>
    </div>
  );
}

function ReportCard({
  report, onResolve,
}: {
  report: Report;
  onResolve: (id: string, action: "dismiss" | "delete" | "suspend", msg: string) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  function act(action: "dismiss" | "delete" | "suspend", msg: string) {
    setBusy(action);
    setTimeout(() => onResolve(report.id, action, msg), 240);
  }

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{
        background: "var(--surface)", boxShadow: "var(--card-shadow)",
        opacity: busy ? 0.45 : 1, transform: busy ? "scale(0.985)" : "none",
        transition: "opacity 0.25s, transform 0.25s",
      }}
    >
      {/* meta strip */}
      <div
        className="flex items-center gap-2.5 px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <ReasonBadge reason={report.reason} />
        <span className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          · {report.kind === "post" ? "Post" : "Commentaire"} signalé
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
          <span className="flex items-center gap-1 font-bold" style={{ color: "var(--like)" }}>
            <Icon name="flag" size={12} color="currentColor" stroke={2.2} />
            {report.count}
          </span>
          · {report.time}
        </span>
      </div>

      {/* content */}
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2.5 mb-2.5">
          <Link href={`/profile/${report.author.username}`}>
            <Avatar displayName={report.author.displayName} src={report.author.avatarUrl} size={34} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-display font-bold text-[14px]" style={{ color: "var(--text)" }}>
                {report.author.displayName}
              </span>
              <span className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
                @{report.author.username}
              </span>
              {report.kind === "comment" && report.onPostAuthor && (
                <span className="text-[12px]" style={{ color: "var(--text-faint)" }}>
                  · en réponse à @{report.onPostAuthor.username}
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className="rounded-[12px] px-3.5 py-3 border-l-[3px]"
          style={{
            background: "var(--surface-2)",
            borderColor: "color-mix(in oklch, var(--like) 60%, var(--surface-2))",
          }}
        >
          <p className="text-[14px] leading-relaxed m-0" style={{ color: "var(--text)" }}>
            {report.text}
          </p>
        </div>

        {/* actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={() => act("dismiss", "Signalement ignoré")} style={modBtn("ghost")}>
            <Icon name="check" size={15} /> Ignorer
          </button>
          <button onClick={() => act("delete", "Contenu supprimé")} style={modBtn("warn")}>
            <Icon name="trash" size={15} /> Supprimer
          </button>
          <button onClick={() => act("suspend", `@${report.author.username} suspendu·e`)} style={modBtn("danger")}>
            <Icon name="pause" size={15} /> Suspendre
          </button>
          <Link
            href={`/profile/${report.author.username}`}
            className="hidden md:inline-flex items-center gap-1.5 ml-auto"
            style={{ ...modBtn("ghost"), flex: "none" }}
          >
            Voir le profil <Icon name="chevron" size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function AccountRow({
  account, reportCount, onSetStatus,
}: {
  account: ModAccount;
  reportCount: number;
  onSetStatus: (username: string, status: UserStatus) => void;
}) {
  const { username, displayName, avatarUrl, status } = account;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-[18px]"
      style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
    >
      <Link href={`/profile/${username}`}>
        <Avatar displayName={displayName} src={avatarUrl} size={44} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-[14.5px] truncate" style={{ color: "var(--text)" }}>
            {displayName}
          </span>
          <StatusPill status={status} />
        </div>
        <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-faint)" }}>
          @{username}
          {reportCount > 0 && (
            <span className="font-semibold" style={{ color: "var(--like)" }}>
              {" · "}{reportCount} signalement{reportCount > 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        {status !== "active" && (
          <button onClick={() => onSetStatus(username, "active")} style={{ ...modBtn("soft"), flex: "none" }}>
            Réactiver
          </button>
        )}
        {status === "active" && (
          <button onClick={() => onSetStatus(username, "suspended")} style={{ ...modBtn("warn"), flex: "none" }}>
            Suspendre
          </button>
        )}
        {status !== "banned" && (
          <button onClick={() => onSetStatus(username, "banned")} style={{ ...modBtn("danger"), flex: "none" }}>
            Bannir
          </button>
        )}
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { user: me } = useAuth();

  const [tab, setTab] = useState<Tab>("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [accounts, setAccounts] = useState<ModAccount[]>([]);
  const [acctFilter, setAcctFilter] = useState<AcctFilter>("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const flash = useCallback((msg: string) => setToast(msg), []);

  useEffect(() => {
    if (!me) return;
    if (!me.isAdmin) { router.replace("/home"); return; }
    Promise.all([getReports(), getModAccounts()])
      .then(([r, a]) => { setReports(r); setAccounts(a); })
      .finally(() => setLoading(false));
  }, [me, router]);

  function handleResolve(id: string, action: "dismiss" | "delete" | "suspend", msg: string) {
    if (action === "suspend") {
      const report = reports.find((r) => r.id === id);
      if (report) {
        setAccounts((prev) =>
          prev.map((a) => a.username === report.author.username ? { ...a, status: "suspended" } : a)
        );
        setAccountStatus(report.author.username, "suspended").catch(() => {});
      }
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
    flash(msg);
    if (action === "dismiss") dismissReport(id).catch(() => {});
    else if (action === "delete") deleteContent(id).catch(() => {});
  }

  function handleSetStatus(username: string, status: UserStatus) {
    const previousStatus = accounts.find((a) => a.username === username)?.status;
    setAccounts((prev) => prev.map((a) => a.username === username ? { ...a, status } : a));
    setAccountStatus(username, status).catch(() => {
      if (previousStatus !== undefined) {
        setAccounts((prev) => prev.map((a) => a.username === username ? { ...a, status: previousStatus } : a));
      }
    });
    flash(
      status === "active" ? "Compte réactivé ✨" :
      status === "suspended" ? "Compte suspendu" : "Compte banni"
    );
  }

  if (!me?.isAdmin) return null;

  const nActive = accounts.filter((a) => a.status === "active").length;
  const nSusp = accounts.filter((a) => a.status === "suspended").length;
  const nBan = accounts.filter((a) => a.status === "banned").length;

  const reportCountByUser: Record<string, number> = {};
  reports.forEach((r) => {
    reportCountByUser[r.author.username] = (reportCountByUser[r.author.username] ?? 0) + r.count;
  });

  const acctList = accounts.filter(
    (a) => acctFilter === "all" || a.status === acctFilter
  );

  return (
    <div className="flex flex-col min-h-svh">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: "color-mix(in oklch, var(--bg) 80%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 pt-[54px] md:pt-4">
          {/* back button — mobile only */}
          <button
            onClick={() => router.back()}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full shrink-0"
            style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
          >
            <Icon name="back" size={20} color="var(--text)" />
          </button>
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "var(--primary-soft)" }}
          >
            <Icon name="shieldFill" size={19} color="var(--primary)" stroke={2} />
          </div>
          <div>
            <div className="font-display font-extrabold text-[19px]" style={{ color: "var(--text)" }}>Modération</div>
            <div className="hidden md:block text-[12.5px]" style={{ color: "var(--text-faint)" }}>Garde Breezy calme et sain</div>
          </div>
        </div>

        {/* tabs */}
        <div className="md:flex hidden px-3 border-b" style={{ borderColor: "var(--border)" }}>
          {([["reports", "Signalements", reports.length], ["accounts", "Comptes", 0]] as [Tab, string, number][]).map(([k, label, badge]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="relative flex items-center gap-2 px-5 py-3 text-[15px] transition-colors"
              style={{ fontWeight: tab === k ? 800 : 600, color: tab === k ? "var(--text)" : "var(--text-faint)" }}
            >
              {label}
              {badge > 0 && (
                <span
                  className="min-w-[20px] h-5 px-1.5 rounded-full text-[12px] font-extrabold inline-flex items-center justify-center"
                  style={{ background: tab === k ? "var(--like)" : "var(--surface-2)", color: tab === k ? "#fff" : "var(--text-muted)" }}
                >
                  {badge}
                </span>
              )}
              {tab === k && (
                <div
                  className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 h-1 rounded-full"
                  style={{ width: 36, background: "var(--primary)" }}
                />
              )}
            </button>
          ))}
          <div className="flex-1 border-b" style={{ borderColor: "var(--border)" }} />
        </div>

        {/* segmented control — mobile */}
        <div className="md:hidden px-4 pb-3 pt-2">
          <div className="relative flex rounded-full p-1" style={{ background: "var(--surface-2)" }}>
            <div
              className="absolute top-1 bottom-1 rounded-full shadow-sm transition-all duration-[240ms]"
              style={{
                left: `calc(4px + ${tab === "reports" ? 0 : 1} * (50% - 4px))`,
                width: "calc(50% - 4px)",
                background: "var(--surface)",
              }}
            />
            {([["reports", "Signalements", reports.length], ["accounts", "Comptes", 0]] as [Tab, string, number][]).map(([k, label, badge]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className="relative z-10 flex-1 h-9 text-[13.5px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                style={{ color: tab === k ? "var(--primary)" : "var(--text-muted)" }}
              >
                {label}
                {badge > 0 && (
                  <span
                    className="min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-extrabold inline-flex items-center justify-center"
                    style={{ background: "var(--like)", color: "#fff" }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 pb-[120px] md:pb-10 md:px-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-8 h-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin block" />
          </div>
        ) : (
          <>
            {/* stat tiles */}
            <div className="flex gap-2.5 md:gap-3 mb-1">
              <StatTile icon="flag" value={reports.length} label="Signalements" hue={25} />
              <StatTile icon="user" value={nActive} label="Actifs" hue={152} />
              <StatTile icon="pause" value={nSusp} label="Suspendus" hue={70} />
              <StatTile icon="ban" value={nBan} label="Bannis" hue={25} />
            </div>

            {/* Reports tab */}
            {tab === "reports" && (
              <div className="flex flex-col gap-3">
                {reports.length === 0 ? (
                  <div className="flex flex-col items-center py-14 gap-3 text-center">
                    <div
                      className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
                      style={{ background: "var(--primary-soft)" }}
                    >
                      <Icon name="shield" size={34} color="var(--primary)" stroke={1.8} />
                    </div>
                    <div className="font-display font-extrabold text-[18px]" style={{ color: "var(--text)" }}>
                      File vide, tout est calme
                    </div>
                    <p className="text-[14px] max-w-[240px]" style={{ color: "var(--text-muted)" }}>
                      Aucun contenu signalé en attente.
                    </p>
                  </div>
                ) : reports.map((r) => (
                  <ReportCard key={r.id} report={r} onResolve={handleResolve} />
                ))}
              </div>
            )}

            {/* Accounts tab */}
            {tab === "accounts" && (
              <>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {([["all", "Tous"], ["active", "Actifs"], ["suspended", "Suspendus"], ["banned", "Bannis"]] as [AcctFilter, string][]).map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setAcctFilter(k)}
                      className="px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors"
                      style={{
                        background: acctFilter === k ? "var(--primary)" : "var(--surface-2)",
                        color: acctFilter === k ? "var(--on-primary)" : "var(--text-muted)",
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2.5">
                  {acctList.map((account) => (
                    <AccountRow
                      key={account.username}
                      account={account}
                      reportCount={reportCountByUser[account.username] ?? 0}
                      onSetStatus={handleSetStatus}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
