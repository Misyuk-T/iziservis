import { z } from 'zod'

/**
 * AD-9: every secret is read here and nowhere else.
 *
 * Imported from `payload.config.ts`, which runs in every server context — the
 * Next server, the Payload CLI, and migrations — so a bad `.env` fails at boot
 * with a readable message instead of somewhere deep inside a migration. It
 * carries no `server-only` marker precisely because the Payload CLI is not a
 * Next server context; the guarantee that secrets stay server-side comes from
 * nothing under `app/(site)` importing this module.
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
  // No fallback anywhere. `secret: process.env.PAYLOAD_SECRET || ''` would boot
  // the admin with an empty JWT signing key, which forges sessions for free.
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 characters'),

  NEXT_PUBLIC_SITE_URL: z.string().url(),

  // AD-12: optional. Absent means no tag surface at all, which is the correct
  // default until the client decides whether to carry over G-99MVR70KRC.
  NEXT_PUBLIC_GTM_ID: z
    .string()
    .regex(/^GTM-[A-Z0-9]+$/, 'Must be a GTM container id, not a GA4 measurement id')
    .optional(),

  // Transactional mail. Optional — but when absent, no notification is sent and
  // the lead records that fact rather than claiming delivery. See AD-8.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

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

/**
 * Whether a real mail transport exists.
 *
 * Payload's `sendEmail` does not throw when no adapter is configured — it logs
 * the message to the console and resolves. Without this flag the contact form
 * marked every lead `deliveredAt` while nobody was ever notified.
 */
export const hasEmail = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM)
