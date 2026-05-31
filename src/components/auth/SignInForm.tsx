"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPartnerHomePath } from "@/lib/partner-routing";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Input";

export function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let supabase;
      try {
        supabase = createClient();
      } catch {
        setError(
          "Sign in is unavailable — site configuration is incomplete. Please try again later.",
        );
        return;
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const userId = signInData.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type, partner_org_id")
          .eq("id", userId)
          .single();

        if (profile?.user_type === "partner" && profile.partner_org_id) {
          const { data: org } = await supabase
            .from("partner_organizations")
            .select("status")
            .eq("id", profile.partner_org_id)
            .single();

          if (org) {
            router.push(next?.startsWith("/partner") ? next : getPartnerHomePath(org));
            router.refresh();
            return;
          }
        }
      }

      router.push(next || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Sign in to HourQuest"
      subtitle="Access your dashboard and submit challenge proof."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label>Password</Label>
            <a
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <FieldError message={error ?? undefined} />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-text-muted">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="font-medium text-primary hover:underline">
          Sign Up
        </a>
      </p>
    </AuthCard>
  );
}
