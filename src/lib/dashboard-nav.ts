export const DASHBOARD_SECTIONS = [
  { id: "overview", label: "Overview", description: "Your stats and recent activity" },
  { id: "submit", label: "Submit", description: "Upload proof for a challenge" },
  { id: "submissions", label: "Submissions", description: "Track review status" },
  { id: "certificates", label: "Certificates", description: "Milestone certificates" },
  { id: "profile", label: "Profile", description: "Account and public profile" },
] as const;

export type DashboardSectionId = (typeof DASHBOARD_SECTIONS)[number]["id"];

export function dashboardSectionHref(id: DashboardSectionId): string {
  return `/dashboard#${id}`;
}

export function dashboardSubmitHref(challengeId?: string): string {
  if (!challengeId) return dashboardSectionHref("submit");
  return `/dashboard?challengeId=${encodeURIComponent(challengeId)}#submit`;
}

export function parseDashboardSection(
  hash: string,
): DashboardSectionId {
  const id = hash.replace("#", "") as DashboardSectionId;
  return DASHBOARD_SECTIONS.some((s) => s.id === id) ? id : "overview";
}

export function getDashboardSectionMeta(id: DashboardSectionId) {
  return DASHBOARD_SECTIONS.find((s) => s.id === id)!;
}
