/**
 * Admin UI access: Google session email must appear in ADMIN_ALLOWLIST.
 * Empty allowlist ⇒ no one is admin (safe default for prod).
 */
export function parseAdminAllowlist(): Set<string> {
  const raw = process.env.ADMIN_ALLOWLIST ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  const allow = parseAdminAllowlist();
  if (allow.size === 0) return false;
  return allow.has(email.trim().toLowerCase());
}

export function adminAccessConfigured(): boolean {
  return parseAdminAllowlist().size > 0;
}
