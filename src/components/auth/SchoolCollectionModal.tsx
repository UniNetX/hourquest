"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function SchoolCollectionModal() {
  const router = useRouter();
  const [school, setSchool] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_name")
        .eq("id", user.id)
        .single();
      if (!profile?.school_name) setOpen(true);
    }
    check();
  }, []);

  async function save() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ school_name: school })
      .eq("id", user.id);
    setOpen(false);
    router.refresh();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <AuthCard title="What's your school?">
        <p className="mb-4 text-[12px] text-text-muted">
          We need your school name to show on your profile and leaderboard.
        </p>
        <Label>School Name</Label>
        <Input value={school} onChange={(e) => setSchool(e.target.value)} />
        <Button className="mt-4 w-full" onClick={save} disabled={!school.trim()}>
          Continue
        </Button>
      </AuthCard>
    </div>
  );
}
