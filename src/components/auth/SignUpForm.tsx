"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export type SignUpAccountType = "student" | "partner";

const toggleBtn =
  "flex-1 rounded-sm border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function SignUpForm({
  defaultAccountType = "student",
}: {
  defaultAccountType?: SignUpAccountType;
}) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<SignUpAccountType>(defaultAccountType);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isPartner = accountType === "partner";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let supabase;
      try {
        supabase = createClient();
      } catch {
        setError(
          "Account creation is unavailable — site configuration is incomplete. Please try again later.",
        );
        return;
      }

      const metadata = isPartner
        ? {
            account_type: "partner",
            full_name: fullName,
            organization_name: orgName,
            organization_description: orgDescription,
            organization_website: website,
          }
        : { full_name: fullName, school_name: school };

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!data.session) {
        setSuccess(
          isPartner
            ? "Partner account created! Confirm your email, then sign in. Your organization will be reviewed before you can post challenges."
            : "Account created! Check your email to confirm your address, then sign in.",
        );
        return;
      }

      if (isPartner) {
        await fetch("/api/notify-admin-partner-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgName }),
        }).catch(() => {});
        router.push("/partner/pending");
      } else {
        router.push("/dashboard");
      }
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
      title="Create your account"
      subtitle={
        isPartner
          ? "Post partnership challenges for students after your organization is approved."
          : "Join HourQuest and start earning verified volunteer hours."
      }
    >
      <div
        className="mb-6 flex gap-2"
        role="tablist"
        aria-label="Account type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!isPartner}
          onClick={() => setAccountType("student")}
          className={cn(
            toggleBtn,
            !isPartner
              ? "border-primary bg-primary text-white"
              : "border-border bg-surface text-text-muted hover:text-text",
          )}
        >
          Student
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isPartner}
          onClick={() => setAccountType("partner")}
          className={cn(
            toggleBtn,
            isPartner
              ? "border-primary bg-primary text-white"
              : "border-border bg-surface text-text-muted hover:text-text",
          )}
        >
          Partner organization
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>{isPartner ? "Your name" : "Full Name"}</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        {isPartner ? (
          <>
            <div>
              <Label>Organization name</Label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Organization description</Label>
              <Textarea
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
            <div>
              <Label>Website (optional)</Label>
              <Input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
              />
            </div>
          </>
        ) : (
          <div>
            <Label>School Name</Label>
            <Input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              required
            />
          </div>
        )}

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
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <FieldError message={error ?? undefined} />
        {success ? (
          <p className="rounded-xl border border-primary-mid bg-primary-light/40 px-4 py-3 text-sm text-text">
            {success}
          </p>
        ) : null}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading
            ? "Creating..."
            : isPartner
              ? "Create partner account"
              : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <a
          href={isPartner ? "/signin?next=/partner" : "/signin"}
          className="font-medium text-primary hover:underline"
        >
          Sign In
        </a>
      </p>
    </AuthCard>
  );
}
