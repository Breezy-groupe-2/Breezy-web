import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-black/90 active:bg-black/80",
  outline:
    "bg-white text-ink border border-line-strong hover:bg-canvas active:bg-canvas",
  ghost:
    "bg-transparent text-ink hover:bg-surface active:bg-surface",
  danger:
    "bg-transparent text-red-600 hover:bg-red-50 active:bg-red-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-[30px] px-[14px] text-[13px]",
  md: "h-[34px] px-[18px] text-[14px]",
  lg: "h-[50px] px-6 text-[16px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          "inline-flex w-full items-center justify-center gap-2 rounded-full font-bold cursor-pointer transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {isLoading ? (
          <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
