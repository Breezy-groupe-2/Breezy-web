import Image from "next/image";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: Size;
  className?: string;
}

const sizeMap: Record<Size, { cls: string; px: number; text: string }> = {
  xs: { cls: "size-[26px]", px: 26, text: "text-[10px]" },
  sm: { cls: "size-[34px]", px: 34, text: "text-[12px]" },
  md: { cls: "size-[40px]", px: 40, text: "text-[13px]" },
  lg: { cls: "size-[48px]", px: 48, text: "text-[16px]" },
  xl: { cls: "size-[68px]", px: 68, text: "text-[24px]" },
};

export function Avatar({ src, alt, size = "md", className = "" }: AvatarProps) {
  const { cls, px, text } = sizeMap[size];
  const initials = alt
    .split(" ")
    .slice(0, 1)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={[
        "relative rounded-full shrink-0 overflow-hidden bg-ink flex items-center justify-center font-bold text-white",
        cls,
        text,
        className,
      ].join(" ")}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        initials
      )}
    </div>
  );
}
