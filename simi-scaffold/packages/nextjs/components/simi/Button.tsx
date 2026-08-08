import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-sky-400 to-sky-500 text-navy-950 hover:from-sky-300 hover:to-sky-400 shadow-lg shadow-sky-500/25 focus-visible:ring-sky-400/50",
  secondary:
    "bg-navy-800 text-white hover:bg-navy-700 border border-white/10 focus-visible:ring-navy-400/40",
  ghost: "text-navy-200 hover:bg-white/5 hover:text-white focus-visible:ring-white/20",
  success:
    "bg-gradient-to-br from-emerald-400 to-emerald-500 text-navy-950 hover:from-emerald-300 hover:to-emerald-400 shadow-lg shadow-emerald-500/25 focus-visible:ring-emerald-400/50",
  danger:
    "bg-gradient-to-br from-rose-400 to-rose-500 text-navy-950 hover:from-rose-300 hover:to-rose-400 shadow-lg shadow-rose-500/25 focus-visible:ring-rose-400/50",
  outline:
    "border border-white/15 text-navy-100 hover:bg-white/5 hover:border-white/25 bg-transparent focus-visible:ring-white/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 outline-none focus-visible:ring-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
