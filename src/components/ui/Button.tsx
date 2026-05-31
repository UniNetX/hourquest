import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-primary text-white border border-primary hover:bg-primary-dark btn-on-dark",
  secondary:
    "bg-surface text-primary-dark border border-border hover:bg-primary-light/50",
  danger: "bg-error text-white border border-transparent hover:bg-[#c62828] btn-on-dark",
  ghost: "bg-transparent text-primary hover:bg-primary-light/40 border border-transparent",
  navCta: "bg-primary-mid text-white border border-transparent hover:bg-primary btn-on-dark",
  white: "bg-white text-primary-dark border border-border hover:bg-primary-light/30",
  outlineWhite: "btn-on-dark-outline",
  ghostOnDark: "btn-on-dark-outline border-transparent hover:bg-white/10",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm rounded-sm",
  md: "px-5 py-2.5 text-sm rounded-sm",
  lg: "px-6 py-3 text-base rounded-sm",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
  className?: string;
};

const darkBgVariants = new Set<Variant>([
  "primary",
  "danger",
  "navCta",
  "outlineWhite",
  "ghostOnDark",
]);

export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className,
  ...props
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    darkBgVariants.has(variant)
      ? "focus-visible:ring-white focus-visible:ring-offset-primary-dark"
      : "focus-visible:ring-primary focus-visible:ring-offset-2",
    sizes[size],
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
