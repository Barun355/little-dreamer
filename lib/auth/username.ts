/**
 * Build a stable, readable R2 username from display name or email + user id suffix.
 * Example: "Prarambhi Varane" + id "abc123xyz" → "prarambhi-varane-abc123"
 */
export function allocateUsername(params: {
  userId: string
  name?: string | null
  email: string
}): string {
  const emailLocal = params.email.split("@")[0] ?? "user"
  const source = (params.name?.trim() || emailLocal).toLowerCase()

  const slug = source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 48)

  const suffix = params.userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toLowerCase()
  const base = slug.length > 0 ? slug : "user"

  return `${base}-${suffix || "user"}`
}
