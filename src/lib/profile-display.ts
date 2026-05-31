/** Display name for nav, dashboard sidebar, etc. */
export function getProfileDisplayName(
  fullName?: string | null,
  email?: string | null,
  metadataFullName?: string | null,
): string {
  const trimmed = fullName?.trim() || metadataFullName?.trim();
  if (trimmed) return trimmed;

  const fromEmail = email?.split("@")[0]?.trim();
  if (fromEmail) return fromEmail;

  return "Member";
}

export function getDisplayInitial(name: string): string {
  const initial = name.trim().charAt(0);
  return initial ? initial.toUpperCase() : "?";
}
