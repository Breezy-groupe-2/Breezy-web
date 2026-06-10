interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Chargement…"
      className={[
        "block rounded-full border-primary border-t-transparent animate-spin",
        sizeClasses[size],
        className,
      ].join(" ")}
    />
  );
}
