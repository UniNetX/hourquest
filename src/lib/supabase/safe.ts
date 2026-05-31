import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function tryCreateClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    return createClient();
  } catch {
    return null;
  }
}

/** Run a browser Supabase call without throwing on network errors. */
export async function withBrowserSupabase<T>(
  fn: (client: SupabaseClient) => Promise<T>,
): Promise<{ data: T | null; error: Error | null }> {
  const client = tryCreateClient();
  if (!client) {
    return { data: null, error: new Error("Supabase is not configured") };
  }

  try {
    const data = await fn(client);
    return { data, error: null };
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error("Supabase request failed");
    return { data: null, error };
  }
}
