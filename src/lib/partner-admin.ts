import { createServiceClient } from "@/lib/supabase/server";
import type { PartnerOrganization } from "@/types/database";

export {
  getSupabaseProjectRef,
  partnerSetupErrorMessage,
  SUPABASE_PROJECT_REF,
} from "@/lib/partner-admin-errors";

export async function loadPartnerOrganizationsForAdmin(): Promise<{
  data: PartnerOrganization[];
  error: { message: string } | null;
}> {
  const service = await createServiceClient();
  if (!service) {
    return {
      data: [],
      error: { message: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
    };
  }

  const { data, error } = await service
    .from("partner_organizations")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    data: (data as PartnerOrganization[]) ?? [],
    error: error ? { message: error.message } : null,
  };
}
