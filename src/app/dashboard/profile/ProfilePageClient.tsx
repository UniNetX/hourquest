"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "@/components/marketing/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { SITE_URL } from "@/lib/seo";
import type { Profile } from "@/types/database";

export default function ProfilePageClient({
  initialProfile,
  embedded = false,
}: {
  initialProfile?: Profile | null;
  embedded?: boolean;
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialProfile) return;
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
    load();
  }, [initialProfile]);

  async function save() {
    if (!profile) return;
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        school_name: profile.school_name,
        is_public: profile.is_public,
      })
      .eq("id", profile.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) return null;

  const shareUrl = `${SITE_URL}/profile/${profile.id}`;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {!embedded && <h2 className="text-lg font-medium">My Profile</h2>}
      <Card className="bg-primary text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-medium">
            {profile.full_name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-medium">{profile.full_name}</p>
            <p className="text-sm text-white/75">{profile.school_name}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
        <StatCard
          value={String(profile.total_verified_hours)}
          label="Verified Hours"
        />
        <StatCard value={String(profile.week_streak)} label="Week Streak" />
      </div>

      <Card className="space-y-3">
        <div>
          <Label>Full Name</Label>
          <Input
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
          />
        </div>
        <div>
          <Label>School Name</Label>
          <Input
            value={profile.school_name ?? ""}
            onChange={(e) =>
              setProfile({ ...profile, school_name: e.target.value })
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={profile.is_public}
            onChange={(e) =>
              setProfile({ ...profile, is_public: e.target.checked })
            }
          />
          Make my profile public for college applications
        </label>
        <Button onClick={save} className="w-full">
          {saved ? "Saved!" : "Save Profile"}
        </Button>
        {profile.is_public && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
          >
            Share My Profile
          </Button>
        )}
      </Card>
    </div>
  );
}
