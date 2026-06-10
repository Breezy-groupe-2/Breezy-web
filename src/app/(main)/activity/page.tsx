export default function ActivityPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 px-5">
      <div
        className="w-14 h-14 flex items-center justify-center rounded-[18px] mb-2"
        style={{ background: "var(--primary-soft)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <h1 className="font-display font-extrabold text-[22px] tracking-tight" style={{ color: "var(--text)" }}>
        Activité
      </h1>
      <p className="text-[15px] text-center max-w-[280px]" style={{ color: "var(--text-muted)" }}>
        Tes notifications apparaîtront ici.
      </p>
    </div>
  );
}
