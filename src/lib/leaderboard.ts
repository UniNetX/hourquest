export type SchoolLeaderboardRow = {
  school_name: string;
  student_count: number;
  total_hours: number;
};

/** Client-side fallback when the DB view hasn't been migrated yet. */
export function normalizeSchoolLeaderboard(
  rows: SchoolLeaderboardRow[],
): SchoolLeaderboardRow[] {
  const merged = new Map<string, SchoolLeaderboardRow>();

  for (const row of rows) {
    const key = row.school_name.trim().toLowerCase();
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        school_name: row.school_name.trim(),
        student_count: row.student_count,
        total_hours: Number(row.total_hours),
      });
      continue;
    }

    existing.student_count += row.student_count;
    existing.total_hours += Number(row.total_hours);
  }

  return Array.from(merged.values()).sort(
    (a, b) =>
      b.total_hours - a.total_hours ||
      a.school_name.localeCompare(b.school_name),
  );
}
