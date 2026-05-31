import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let navUser: { name: string; avatarUrl?: string | null } | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();

    navUser = {
      name: profile?.full_name || user.email?.split("@")[0] || "Student",
      avatarUrl: profile?.avatar_url,
    };
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AnnouncementBar />
      <NavBar user={navUser} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
