import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * AD-9: Supabase RLS denies by default.
 *
 * Supabase grants the `anon` and `authenticated` roles full DML on every table
 * in `public`, and exposes that schema through PostgREST. The `anon` key is
 * public by design — it ships to the browser. Without this migration, anyone
 * holding it can SELECT `leads` (customer personal data), SELECT `users`
 * (password hashes), and TRUNCATE the entire CMS.
 *
 * Payload connects as `postgres`, which owns these tables. A table owner
 * bypasses RLS unless FORCE ROW LEVEL SECURITY is set, so enabling RLS with no
 * policies locks out PostgREST while leaving Payload untouched. We deliberately
 * do NOT force it.
 *
 * Revoking the grants as well is belt and braces: RLS alone is sufficient, but
 * a future `GRANT` in another migration should not silently re-open the door.
 */

const REVOKE_AND_ENABLE = sql`
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t.relname);
  END LOOP;
END $$;

-- Stop future tables in the public schema from inheriting the same grants.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
`

const DISABLE = sql`
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t.relname);
    EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated', t.relname);
  END LOOP;
END $$;
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(REVOKE_AND_ENABLE)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restores the insecure default. Only meaningful when rolling the whole
  // schema back — never run this on its own.
  await db.execute(DISABLE)
}
