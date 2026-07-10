# Status — 2026-07-10

Written at the end of the first build session. Read this before picking the
project back up.

## Where it stands

The site builds, all 22 legacy URLs resolve, and the whole thing is under test:
**68 unit + 229 end-to-end**, the latter across desktop, tablet and mobile.

| Requirement | State |
|---|---|
| 22 legacy URLs resolve, single hop | ✅ verified against a running server |
| WCAG 2.2 AA, every route, 3 breakpoints | ✅ axe-core in the build gate, 0 violations |
| Metadata carried over verbatim | ✅ seeded from the crawl |
| `LocalBusiness` / `Service` / `FAQPage` schema | ✅ derived from CMS content |
| Media requires alt text | ✅ enforced in the collection |
| Contact form, voivodeship routing | ✅ persists before mailing; REST create closed |
| Transactional mail | ⚠️ adapter wired, no SMTP credentials yet |
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

## What an adversarial review found afterwards

An independent review pass over the finished code found six real defects. All
are fixed; each is worth remembering because none would have shown up in a
screenshot.

1. **The contact form emailed nobody, and said it had.** No SMTP adapter was
   configured, and Payload's `sendEmail` does not throw without one — it logs
   and resolves. Every lead was stamped `deliveredAt` while the advisor inbox
   received nothing. Now the absence of a transport is recorded against the
   lead, and a nodemailer adapter engages the moment `SMTP_*` is set.

2. **`src/env.ts` was imported nowhere, so none of its validation ran.** Worse,
   `payload.config.ts` had `secret: process.env.PAYLOAD_SECRET || ''` — with the
   variable unset, the admin booted with an empty JWT signing key. It is now
   imported from the config, which every server context loads, and the fallback
   is gone.

3. **`POST /api/leads` was open to the public.** `create: () => true` on the
   collection let anyone write straight to the table, skipping the honeypot and
   the schema. A bot was persisted during the review. Closed; the server action
   reaches the collection through the Local API, which bypasses access control.

4. **Every slashed legacy URL took two hops.** All 22 legacy WordPress URLs
   ended in a slash. Next's trailing-slash normalisation fired a 308 first, then
   our 301 ran. The unit test asserting "single hop" only walked an in-memory
   map and never made a request. Fixed with `skipTrailingSlashRedirect` and
   explicit slashed sources; there is now an HTTP-level test for all 44 variants.

5. **`findByID` throws on a missing id**, so an unknown voivodeship skipped the
   notification entirely — the precise "dropped, never delivered" outcome FR-14
   forbids. `disableErrors: true` restores the fallback path.

6. **`robots.txt` returned a 404.** `robots.ts` sat inside the `(site)` route
   group, where Next silently does not emit it. AD-10's claim that `/admin` is
   disallowed to crawlers was false for the whole session.

The pattern worth noting: four of the six were places where a comment or a test
asserted something the code did not do. Tests that check a data structure rather
than the running system are the most expensive kind of false confidence.

## Session 2 (2026-07-10, afternoon)

- **Lenis removed.** The client's verdict on smooth scroll was "slowpoke";
  scrolling is native now, the scrollbar is branded via CSS `scrollbar-color`
  on tokens. Reveals, hovers and the carousel are untouched.
- **Hero redesigned to reference v2** (light theme): arch-masked photo, floating
  trust card with outline icons, green display accent. The photo is the
  client's own (technician servicing an espresso machine, pulled from their
  WordPress uploads), served as ~49KB AVIF through the Next optimizer.
  LCP: 96 ms on the image. The v2 reference repeats every invented fact from
  v1 (24/7, wrong phone, 15+/5000+, "Warszawa i okolice") plus a misspelled
  "UNIK" and three unserviced brands in its logo wall — none of it shipped.
  See docs/design/reference-v2-analysis.md.
- Code in this session was written by Opus 4.8 subagents with Fable
  orchestrating; an optimizer `localPatterns` gap the hero agent found was
  fixed properly (config now allows `/hero/**`) rather than left as
  `unoptimized`.

## Session 3 (2026-07-10, afternoon) — the sales gap

The client confirmed the business also **sells** equipment. His own site said
it on five pages; we had recorded it in the brief and modelled none of it.
Full analysis: docs/planning/analysis/gap-analysis-sales-2026-07-10.md.
Built (FR-19/FR-20, Opus subagents, Fable orchestrating):

- 4th service page "Dobór i sprzedaż sprzętu" (authored SEO — no legacy URL),
  contact-form topic "Zakup / dobór sprzętu", `brands.distributor` flag
  (AD-17: independent from `authorized`, all false until OQ-11).
- Homepage: "Jak działamy" 4-step process, dark sales teaser band, and the
  restored "Zaufali nam" block — 8 real client logos (incl. Narodowy Bank
  Polski, Grycan, Nice To Fit You) recovered from the legacy site's own
  uploads. OQ-12 (logo permission) flagged in code.
- o-firmie got the client's team photo.
- AD-3 hardening: `payload run` scripts default to NODE_ENV=development and
  had silently enabled Drizzle push against the live DB (a `dev` marker sits
  in payload_migrations; CI `payload migrate` will need --force-accept-warning
  once). Push now requires explicit PAYLOAD_PUSH=1.

Full matrix after: 235 e2e + 68 unit green.

## Risks

- **The e2e suite writes to the production database.** `.env` points at the live
  Supabase project, so the contact-form tests create real `leads` rows. They are
  scoped to the desktop project and cleaned by hand. This needs a dedicated test
  database before anyone runs the suite in CI.
- **The database password was pasted into a chat transcript.** Rotate it. See
  `docs/internal/credentials.md`, which is gitignored.
- **No SMTP credentials yet.** The adapter is wired; set `SMTP_HOST`,
  `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` and notifications start flowing. Until
  then every lead is persisted and carries `deliveryError` saying so.
- **No rate limiting on the contact form.** The REST surface is closed and the
  honeypot works, but a determined bot can still submit through the server
  action. Needed before launch.

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
