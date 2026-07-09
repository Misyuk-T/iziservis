# Status — 2026-07-10

Written at the end of the first build session. Read this before picking the
project back up.

## Where it stands

The site builds, all 22 legacy URLs resolve, and the whole thing is under test:
**68 unit + 175 end-to-end**, the latter across desktop, tablet and mobile.

| Requirement | State |
|---|---|
| 22 legacy URLs resolve, single hop | ✅ verified against a running server |
| WCAG 2.2 AA, every route, 3 breakpoints | ✅ axe-core in the build gate, 0 violations |
| Metadata carried over verbatim | ✅ seeded from the crawl |
| `LocalBusiness` / `Service` / `FAQPage` schema | ✅ derived from CMS content |
| Media requires alt text | ✅ enforced in the collection |
| Contact form, voivodeship routing | ✅ persists before mailing |
| GTM behind a consent gate | ✅ asserted at the network layer |
| CMS the client can operate | ✅ Payload at `/admin`, 83 records seeded |
| Core Web Vitals | ⚠️ LCP measured at 112 ms locally; no field data |
| Media on Supabase Storage | ❌ not wired |
| Search Console baseline | ❌ blocked on the client (OQ-2) |

## What the tests caught

Writing the gates found four bugs that review would not have:

1. **Reduced-motion visitors got a blank page.** `useReducedMotion()` returns
   `null` on the first client render, so motion wrote an inline `opacity: 0`
   before the flag resolved; once `whileInView` was dropped nothing animated it
   back. Fixed by moving the gate into CSS, which beats an inline style and
   lands before first paint. See AD-13.

2. **There was no mobile navigation at all.** The nav was hidden below `lg` and
   no burger existed — on a phone, where the primary user is, the site could not
   be navigated.

3. **The honeypot taught bots which field to skip.** It lived inside the zod
   schema, so a filled honeypot produced a validation error *naming the
   honeypot*. It is now checked before validation, and a bot sees success.

4. **The palette failed its own contrast rule twice.** `#38863B` was derived
   against `#FFFFFF` but measured against the page's `#FEFEFE` it gives 4.49:1.
   And every `text-*/80` opacity modifier invented a colour no test had ever
   measured. See AD-14.

## What was found in the client's Supabase

**The database was open to the internet.** Supabase grants `anon` and
`authenticated` full DML on every table in `public` and exposes it through
PostgREST. The `anon` key is public by design — it ships to browsers. Before
`20260709_221000_rls_lockdown`, anyone holding it could read `leads` (customer
personal data), read `users` (password hashes), and `TRUNCATE` the CMS.

RLS is now enabled on all 26 tables, the grants are revoked, and
`ALTER DEFAULT PRIVILEGES` stops future tables inheriting them. Payload connects
as the table owner and bypasses RLS, so it is unaffected — `FORCE ROW LEVEL
SECURITY` is deliberately *not* set, as it would break the CMS.

Also: the direct connection host `db.<ref>.supabase.co` does not resolve on this
project. The session pooler stands in for it. See AD-2.

## Risks

- **The e2e suite writes to the production database.** `.env` points at the live
  Supabase project, so the contact-form tests create real `leads` rows. They are
  scoped to the desktop project and cleaned by hand. This needs a dedicated test
  database before anyone runs the suite in CI.
- **The database password was pasted into a chat transcript.** Rotate it. See
  `docs/internal/credentials.md`, which is gitignored.
- **No email adapter is configured.** Lead notifications are written to the
  console. AD-8 means no lead is lost, but nobody is being notified either.

## Deliberately not built

- The design reference's **stats row** (`5000+ napraw`, `15+ lat`, `24h`,
  `100%`). No figure has a source, and the live site says `10+ lat`. FR-3 makes
  an unsourced stat unpublishable. See OQ-4.
- The reference's **`SERWIS 24/7`** badge. The contact page says Mon–Fri
  08:00–17:00. Shipping it would be a false-advertising exposure and would make
  `openingHours` a lie in structured data. See OQ-5.
- **`Realizacje`** (case studies). In the reference's navigation; the content
  type does not exist and no case studies are written.
- **Brand logos.** The legacy site carries none — brands are text there too. Four
  of the reference's logos are for brands IZI does not list.

## Next

1. Answer OQ-1 (Warszawa vs cała Polska), OQ-3 (does the knowledge centre become
   a blog), OQ-5 (is 24/7 true). All three change the content model or the copy.
2. Wire Supabase Storage for media, and a transactional mail provider.
3. Stand up a test database, then put the e2e suite in CI.
4. Capture the Search Console baseline **before** any cutover, or the redesign's
   SEO impact is unmeasurable.
