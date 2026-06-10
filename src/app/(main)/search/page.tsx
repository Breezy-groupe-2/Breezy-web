export default function SearchPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 px-5">
      <div
        className="w-14 h-14 flex items-center justify-center rounded-[18px] mb-2"
        style={{ background: "var(--primary-soft)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h1 className="font-display font-extrabold text-[22px] tracking-tight" style={{ color: "var(--text)" }}>
        Découvrir
      </h1>
      <p className="text-[15px] text-center max-w-[280px]" style={{ color: "var(--text-muted)" }}>
        La recherche arrive bientôt. Explore le feed en attendant.
      </p>
    </div>
  );
}
