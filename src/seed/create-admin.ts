import { getPayload } from 'payload'

import config from '@payload-config'

/**
 * Creates the first Payload admin. Run with:
 *   ADMIN_EMAIL=… ADMIN_PASSWORD=… pnpm payload run src/seed/create-admin.ts
 *
 * Idempotent and refuses to be a back door: if any user already exists it does
 * nothing and exits 0. The Users collection only lets an existing admin create
 * users (see src/collections/Users.ts), so this seam — the Local API, which
 * bypasses access control — is the only way to mint the very first one. It is
 * deliberately narrow: it creates one admin when the table is empty, never a
 * second.
 */

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.')
  process.exit(1)
}

const payload = await getPayload({ config })

const existing = await payload.count({ collection: 'users' })
if (existing.totalDocs > 0) {
  console.log('users exist, skipping')
  process.exit(0)
}

await payload.create({
  collection: 'users',
  data: { email, password, role: 'admin' },
})

console.log(`Created admin user: ${email}`)
process.exit(0)
