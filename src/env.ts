import 'server-only'

import { z } from 'zod'

/**
 * AD-9: every secret is read here and nowhere else, and this module is
 * server-only, so importing it from a client component is a build error rather
 * than a leaked service-role key.
 *
 * AD-2: DATABASE_URL and DATABASE_DIRECT_URL are different connections, not
 * two names for one. The transaction pooler has no prepared statements, so
 * migrations must not run over it.
 */
const schema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((u) => u.includes(':6543'), {
      message:
        'DATABASE_URL must be the transaction pooler (port 6543). See AD-2. Use DATABASE_DIRECT_URL for migrations.',
    }),
  DATABASE_DIRECT_URL: z
    .string()
    .url()
    .refine((u) => !u.includes(':6543'), {
      message:
        'DATABASE_DIRECT_URL must not be the transaction pooler — it has no prepared statements and migrations will fail. See AD-2.',
    }),
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 characters'),

  NEXT_PUBLIC_SITE_URL: z.string().url(),

  // Supabase Storage, S3-compatible. Optional until media upload is wired.
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n')
  throw new Error(`Invalid environment:\n${issues}`)
}

export const env = parsed.data

export const hasS3 = Boolean(
  env.S3_BUCKET && env.S3_ENDPOINT && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY,
)
