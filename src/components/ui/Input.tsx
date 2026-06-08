import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-[6px] w-full">
        {label ? (
          <label
            htmlFor={id}
            className="text-[11px] font-bold uppercase tracking-[0.06em] text-sub"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          {prefix ? (
            <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[15px] text-sub pointer-events-none">
              {prefix}
            </span>
          ) : null}
          <input
            ref={ref}
            id={id}
            className={[
              "w-full h-12 border-[1.5px] rounded-[10px] px-[14px] text-[15px] text-ink bg-canvas",
              "placeholder:text-muted outline-none transition-colors",
              "focus:border-ink focus:bg-white",
              prefix ? "pl-[28px]" : "",
              error
                ? "border-red-500 focus:border-red-500"
                : "border-line",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
        </div>
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
