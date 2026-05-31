"use client";

import { useState } from "react";
import { IconMail } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile`,
      },
    );
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check your email" subtitle={`We sent a password reset link to ${email}.`}>
        <Button href="/signin" variant="primary" className="w-full" size="lg">
          Back to Sign In
        </Button>
      </AuthCard>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded border border-border bg-surface shadow-card">
        <div className="h-1 bg-primary-mid" aria-hidden />
        <div className="p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
              <IconMail size={24} />
            </div>
          </div>
          <h1 className="text-center font-display text-xl font-semibold text-primary-dark">
            Reset your password
          </h1>
          <p className="mt-2 text-center text-sm text-text-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <FieldError message={error ?? undefined} />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <Button href="/signin" variant="ghost" className="mt-4 w-full">
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
