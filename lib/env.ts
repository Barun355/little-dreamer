import "server-only"

/**
 * Server-side environment access.
 *
 * Reads are validated at call time and throw a named error, so a missing
 * credential surfaces as "R2_ACCESS_KEY_ID is not set" rather than an
 * undefined slipping into an SDK and failing three layers down.
 *
 * `server-only` guarantees a build error if any of this is ever imported
 * into a client component — these are secrets.
 */
function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL")
  },
  r2: {
    get accountId() {
      return required("R2_ACCOUNT_ID")
    },
    get accessKeyId() {
      return required("R2_ACCESS_KEY_ID")
    },
    get secretAccessKey() {
      return required("R2_SECRET_ACCESS_KEY")
    },
    get bucket() {
      return required("R2_BUCKET")
    },
    get publicBaseUrl() {
      return required("R2_PUBLIC_BASE_URL").replace(/\/+$/, "")
    },
  },
  make: {
    get webhookUrl() {
      return required("MAKE_WEBHOOK_URL")
    },
    get apiKey() {
      return required("MAKE_API_KEY")
    },
    get callbackSecret() {
      return required("MAKE_CALLBACK_HMAC_SECRET")
    },
  },
  get siteUrl() {
    return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
      /\/+$/,
      ""
    )
  },
  /**
   * Where Make should send callbacks. Must be publicly reachable — Make runs
   * in the cloud and cannot see localhost. Set to an ngrok/cloudflared URL in
   * development; falls back to siteUrl so the value is never undefined.
   */
  get publicCallbackUrl() {
    return (process.env.PUBLIC_CALLBACK_URL ?? "").replace(/\/+$/, "")
  },
}
