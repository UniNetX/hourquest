"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Input";

export function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, school_name: school },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join TerraServe and start earning verified volunteer hours."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
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
          <Label>School Name</Label>
          <Input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            required
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
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <a href="/signin" className="font-medium text-primary hover:underline">
          Sign In
        </a>
      </p>
    </AuthCard>
  );
}
