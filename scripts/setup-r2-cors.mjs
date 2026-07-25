/**
 * Applies the CORS rules R2 needs for browser-direct uploads.
 *
 * The browser PUTs photos straight to R2, so the bucket must accept
 * cross-origin PUT from the app's origins. Without this the upload fails in
 * the browser with an opaque CORS error and nothing reaches the bucket.
 *
 *   node scripts/setup-r2-cors.mjs [extra-origin ...]
 */
import "dotenv/config"
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3"

const extra = process.argv.slice(2)
const origins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.PUBLIC_CALLBACK_URL,
  ...extra,
].filter(Boolean)

const unique = [...new Set(origins)]

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

await client.send(
  new PutBucketCorsCommand({
    Bucket: process.env.R2_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: unique,
          AllowedMethods: ["PUT", "GET", "HEAD"],
          AllowedHeaders: ["content-type"],
          ExposeHeaders: ["etag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  })
)

const current = await client.send(
  new GetBucketCorsCommand({ Bucket: process.env.R2_BUCKET })
)
console.log("CORS applied to", process.env.R2_BUCKET)
console.log(JSON.stringify(current.CORSRules, null, 2))
