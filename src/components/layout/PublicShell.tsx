import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { getProfileDisplayName } from "@/lib/profile-display";
import { createClient } from "@/lib/supabase/server";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  let navUser: { name: string; avatarUrl?: string | null } | null = null;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      navUser = {
        name: getProfileDisplayName(
          profile?.full_name,
          user.email,
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : null,
        ),
        avatarUrl: profile?.avatar_url,
      };
    }
  }

  return (
    <>
      <AnnouncementBar />
      <NavBar user={navUser} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
