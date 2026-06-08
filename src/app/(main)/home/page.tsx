const MOCK_POSTS = [
  {
    id: 1,
    author: { name: "Sophie Durand", handle: "sophied", initials: "S" },
    body: "Enfin compris les closures en JS après des semaines ☀️ Parfois il suffit d'un bon café.",
    time: "2m",
    comments: 12,
    reposts: 8,
    likes: 47,
    liked: true,
  },
  {
    id: 2,
    author: { name: "Marc Lefèvre", handle: "marcl", initials: "M" },
    body: "Vue du bureau ce matin. Ça donne envie de bosser 🌅",
    time: "18m",
    comments: 5,
    reposts: 3,
    likes: 21,
    liked: false,
  },
  {
    id: 3,
    author: { name: "Lena Kim", handle: "lenak", initials: "L" },
    body: "Les petits projets sont aussi valables que les gros. Lance-toi.",
    time: "1h",
    comments: 32,
    reposts: 19,
    likes: 84,
    liked: false,
  },
  {
    id: 4,
    author: { name: "Alex Martin", handle: "alexmartin", initials: "A" },
    body: "Docker compose pour le dev local, c'est tellement plus propre que d'installer tout à la main. Essayez.",
    time: "3h",
    comments: 8,
    reposts: 11,
    likes: 33,
    liked: false,
  },
];

function PostCard({
  author,
  body,
  time,
  comments,
  reposts,
  likes,
  liked,
}: (typeof MOCK_POSTS)[0]) {
  return (
    <article className="bg-white rounded-2xl mx-3 mt-3 p-5 cursor-pointer hover:shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-shadow">
      <div className="flex gap-3">
        {/* Avatar — squircle pour se distinguer de Twitter */}
        <div className="size-[44px] rounded-[12px] bg-ink flex items-center justify-center text-white text-[14px] font-bold shrink-0">
          {author.initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-[6px] flex-wrap">
            <span className="text-[15px] font-bold text-ink leading-none">{author.name}</span>
            <span className="text-[13px] text-sub">@{author.handle}</span>
            <span className="text-[12px] text-muted ml-auto">{time}</span>
          </div>

          {/* Corps */}
          <p className="text-[15px] text-ink leading-relaxed mb-4">{body}</p>

          {/* Actions */}
          <div className="flex items-center -mx-2">
            <button className="flex items-center gap-2 text-[13px] text-sub flex-1 px-2 py-1.5 rounded-xl hover:bg-surface transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" className="size-[16px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {comments}
            </button>

            <button className="flex items-center gap-2 text-[13px] text-sub flex-1 px-2 py-1.5 rounded-xl hover:bg-surface transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" className="size-[16px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              {reposts}
            </button>

            <button
              className={[
                "flex items-center gap-2 text-[13px] flex-1 px-2 py-1.5 rounded-xl hover:bg-surface transition-colors cursor-pointer",
                liked ? "text-ink font-semibold" : "text-sub",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" className="size-[16px] shrink-0" fill={liked ? "#0A0A0A" : "none"} stroke={liked ? "#0A0A0A" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likes}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Desktop feed header */}
      <div className="hidden md:flex sticky top-0 z-10 h-[52px] items-center px-5 bg-canvas/90 backdrop-blur-sm border-b border-line">
        <h1 className="text-[17px] font-extrabold text-ink tracking-tight">Pour toi</h1>
      </div>

      {/* Composer */}
      <div className="mx-3 mt-3 bg-white rounded-2xl px-5 py-4">
        <div className="flex gap-3">
          <div className="size-[44px] rounded-[12px] bg-ink flex items-center justify-center text-white text-[14px] font-bold shrink-0">
            A
          </div>
          <div className="flex-1">
            <p className="text-[16px] text-muted min-h-[44px] pt-[2px] mb-3">
              Quoi de nouveau ?
            </p>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <div className="flex gap-1">
                <button className="size-[34px] rounded-[8px] flex items-center justify-center hover:bg-surface transition-colors cursor-pointer">
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="#6B6B6B" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </button>
                <button className="size-[34px] rounded-[8px] flex items-center justify-center hover:bg-surface transition-colors cursor-pointer">
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="#6B6B6B" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-muted">280</span>
                <button className="bg-ink text-white rounded-full px-5 py-[7px] text-[14px] font-bold hover:bg-black/90 transition-colors cursor-pointer">
                  Poster
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB — mobile */}
      <button className="fixed bottom-[74px] right-[18px] z-30 size-12 bg-ink rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-black/90 transition-colors cursor-pointer md:hidden">
        <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Feed */}
      <div className="pb-4">
        {MOCK_POSTS.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </>
  );
}
