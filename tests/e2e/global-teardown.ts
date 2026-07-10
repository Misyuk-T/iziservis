import { readFileSync } from 'node:fs'
import path from 'node:path'

import { Client } from 'pg'

/**
 * The contact e2e tests write real `leads` rows to whatever database `.env`
 * points at (currently the live Supabase project — the proper fix is a dedicated
 * test database; see docs/STATUS.md). Until that exists, this teardown removes
 * exactly the rows those tests create, so the suite cleans up after itself
 * instead of leaving them for someone to delete by hand.
 *
 * It connects over the DIRECT connection (not the transaction pooler) and deletes
 * only the fixture address. Nothing else is touched.
 */

// The single email the contact fixtures submit (tests/e2e/contact.spec.ts).
const FIXTURE_EMAIL = 'marek@bistro.example'

function directUrl(): string {
  // Playwright does not load .env, so prefer the process env if something already
  // put it there, and otherwise read the file the same way the seed and tests do.
  if (process.env.DATABASE_DIRECT_URL) return process.env.DATABASE_DIRECT_URL

  const envPath = path.resolve(process.cwd(), '.env')
  const contents = readFileSync(envPath, 'utf8')
  for (const line of contents.split('\n')) {
    const match = line.match(/^\s*DATABASE_DIRECT_URL\s*=\s*(.*)\s*$/)
    if (!match) continue
    // Strip surrounding quotes if the value is quoted.
    return match[1]!.trim().replace(/^["']|["']$/g, '')
  }
  throw new Error('DATABASE_DIRECT_URL not found in environment or .env')
}

export default async function globalTeardown() {
  const client = new Client({ connectionString: directUrl() })
  await client.connect()
  try {
    const result = await client.query('delete from leads where email = $1', [FIXTURE_EMAIL])
    console.log(`[teardown] deleted ${result.rowCount} e2e lead row(s) for ${FIXTURE_EMAIL}`)
  } finally {
    await client.end()
  }
}
