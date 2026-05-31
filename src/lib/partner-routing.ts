import type { PartnerOrgStatus } from "@/types/database";

export function getPartnerHomePath(org: { status: PartnerOrgStatus }): string {
  if (org.status === "approved") return "/partner";
  if (org.status === "rejected") return "/partner/rejected";
  return "/partner/pending";
}
