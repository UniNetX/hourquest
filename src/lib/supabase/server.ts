import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function createClient() {
  const supabaseEnv = getSupabaseEnv();
  if (!supabaseEnv) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from Server Component — middleware handles refresh.
        }
      },
    },
  });
}

export async function createServiceClient() {
  const supabaseEnv = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseEnv || !serviceRoleKey) {
    return null;
  }

  const { createClient: createSupabaseClient } = await import(
    "@supabase/supabase-js"
  );

  return createSupabaseClient(supabaseEnv.url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
