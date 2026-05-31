import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">
      {children}
    </label>
  );
}

export function Input({
  className,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border bg-page px-4 text-sm text-text outline-none transition-colors placeholder:text-text-caption focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        error
          ? "border-[1.5px] border-error"
          : "border-border focus:border-primary",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        "min-h-[100px] w-full resize-none rounded-xl border bg-page px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text-caption focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        error
          ? "border-[1.5px] border-error"
          : "border-border focus:border-primary",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-error">{message}</p>;
}
