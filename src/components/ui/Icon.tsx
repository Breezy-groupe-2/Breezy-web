export type IconName =
  | "home" | "homeFill" | "search" | "bell" | "bellFill"
  | "heart" | "heartFill" | "comment" | "repost" | "share"
  | "bookmark" | "feather" | "plus" | "back" | "close"
  | "more" | "user" | "sun" | "moon" | "settings"
  | "image" | "edit" | "send" | "check" | "gust"
  | "eye" | "eyeOff" | "lock" | "mail";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
}

export function Icon({
  name,
  size = 24,
  stroke = 1.9,
  color = "currentColor",
  className,
}: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <path d="M3.5 11.2 12 4l8.5 7.2M5.5 9.7V19a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.7" />
    ),
    homeFill: (
      <path
        d="M3.5 11.2 12 4l8.5 7.2M5.5 9.7V19a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.7"
        fill={color}
        fillOpacity="0.14"
      />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    bell: (
      <path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 3.5 1 5 1.7 5.8.4.5.1 1.2-.6 1.2H5.4c-.7 0-1-.7-.6-1.2.7-.8 1.7-2.3 1.7-5.8ZM9.8 19a2.3 2.3 0 0 0 4.4 0" />
    ),
    bellFill: (
      <path
        d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 3.5 1 5 1.7 5.8.4.5.1 1.2-.6 1.2H5.4c-.7 0-1-.7-.6-1.2.7-.8 1.7-2.3 1.7-5.8ZM9.8 19a2.3 2.3 0 0 0 4.4 0"
        fill={color}
        fillOpacity="0.14"
      />
    ),
    heart: (
      <path d="M12 20s-7-4.3-9.2-8.3C1.3 9 2.4 5.8 5.5 5.3c2-.3 3.6.9 4.5 2.2.9-1.3 2.5-2.5 4.5-2.2 3.1.5 4.2 3.7 2.7 6.4C19 15.7 12 20 12 20Z" />
    ),
    heartFill: (
      <path
        d="M12 20s-7-4.3-9.2-8.3C1.3 9 2.4 5.8 5.5 5.3c2-.3 3.6.9 4.5 2.2.9-1.3 2.5-2.5 4.5-2.2 3.1.5 4.2 3.7 2.7 6.4C19 15.7 12 20 12 20Z"
        fill={color}
        stroke={color}
      />
    ),
    comment: (
      <path d="M4 11.5C4 7.4 7.6 4.5 12 4.5s8 2.9 8 7-3.6 7-8 7c-.9 0-1.8-.1-2.6-.3L5 19.5l1-3.2A6.5 6.5 0 0 1 4 11.5Z" />
    ),
    repost: (
      <>
        <path d="M5 8.5 7.5 6 10 8.5M7.5 6v8.5a2 2 0 0 0 2 2H15" />
        <path d="M19 15.5 16.5 18 14 15.5M16.5 18V9.5a2 2 0 0 0-2-2H9" />
      </>
    ),
    share: (
      <path d="M12 15.5V4m0 0L8.5 7.5M12 4l3.5 3.5M5.5 12.5V18a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5.5" />
    ),
    bookmark: (
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-3.8L5.5 20V5.5a1 1 0 0 1 1-1Z" />
    ),
    feather: (
      <>
        <path d="M14.5 4.5c2.5 0 4.5 2 4.5 4.5 0 4.5-4.5 8-9.5 8.5L5 18l9-9" />
        <path d="M5 19 9.5 14.5M16 8l-4 4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    back: <path d="M15 5 8 12l7 7" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1.4" fill={color} stroke="none" />
        <circle cx="12" cy="12" r="1.4" fill={color} stroke="none" />
        <circle cx="19" cy="12" r="1.4" fill={color} stroke="none" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8.5" r="3.7" />
        <path d="M5 19.5c.8-3.3 3.5-5 7-5s6.2 1.7 7 5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.5M12 19v2.5M4.5 4.5 6.3 6.3M17.7 17.7l1.8 1.8M2.5 12H5M19 12h2.5M4.5 19.5l1.8-1.8M17.7 6.3l1.8-1.8" />
      </>
    ),
    moon: (
      <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5c0-.7.1-1.4.3-2A8 8 0 1 0 21 16.2c-.6.2-1.3.3-2 .3Z" />
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6 16.6 7.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6" />
      </>
    ),
    image: (
      <>
        <rect x="4" y="5.5" width="16" height="13" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m5 16 4-3.5 3 2.5 3-3 4 4" />
      </>
    ),
    edit: (
      <path d="M4.5 19.5 5 16l9-9 3 3-9 9-3.5.5ZM13 8l3 3" />
    ),
    send: <path d="M5 12 19 5l-4.5 14-3-6.5L5 12Z" />,
    check: <path d="M5 12.5 10 17l9-10" />,
    gust: (
      <path d="M3 9h11a2.5 2.5 0 1 0-2.4-3.2M3 14h8.5a2 2 0 1 1-1.9 2.6M3 11.5h14a2.5 2.5 0 1 1-2.4 3.2" />
    ),
    eye: (
      <>
        <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.6" />
      </>
    ),
    eyeOff: (
      <>
        <path d="M9.5 6.8A8 8 0 0 1 12 6.5c6 0 9.5 5.5 9.5 5.5a16 16 0 0 1-2.4 2.9M6.2 8.2A16 16 0 0 0 2.5 12S6 17.5 12 17.5a8 8 0 0 0 2.8-.5M10.2 10.2a2.6 2.6 0 0 0 3.6 3.6" />
        <path d="M4 4l16 16" />
      </>
    ),
    lock: (
      <>
        <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
        <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
      </>
    ),
    mail: (
      <>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="m4.5 7.5 7.5 5 7.5-5" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name] ?? null}
    </svg>
  );
}
