import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  subtitle,
  eyebrow,
  children,
  large,
  variant = "default",
  imageSrc,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: ReactNode;
  large?: boolean;
  variant?: "default" | "photo";
  imageSrc?: string;
}) {
  if (variant === "photo" && imageSrc) {
    return (
      <section
        className={cn(
          "relative overflow-hidden border-b border-border bg-primary-dark",
          large ? "min-h-[46vh]" : "min-h-[38vh]",
        )}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-primary-dark/70" aria-hidden />
        <div
          className={cn(
            "relative z-10 section-container text-center text-white",
            large ? "py-16 md:py-20" : "py-12 md:py-14",
          )}
        >
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              "font-display font-semibold leading-tight tracking-tight text-white",
              large
                ? "text-[2rem] md:text-[2.75rem] lg:text-[3rem]"
                : "text-[1.75rem] md:text-[2.25rem]",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl px-1 text-sm leading-relaxed text-white/90 sm:text-base">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="page-head page-head--center">
      <div className="section-container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1
          className={cn(
            "font-display text-[1.65rem] sm:text-[2rem]",
            large && "md:text-[2.5rem]",
          )}
        >
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
