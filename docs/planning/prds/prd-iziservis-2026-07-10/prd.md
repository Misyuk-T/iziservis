---
title: iziserwis.pl redesign
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# PRD: iziserwis.pl redesign

## 0. Document Purpose

For the PM, the client, and the downstream architecture and UX workflows. It
builds on three inputs and does not duplicate them: the
[product brief](../../briefs/brief-iziservis-2026-07-10/brief.md) and its
[addendum](../../briefs/brief-iziservis-2026-07-10/addendum.md), the
[legacy site audit](../../../source/legacy-site-audit.md), and the
[design reference analysis](../../../design/reference-analysis.md).

Vocabulary is anchored in §3. Features in §4 carry globally numbered functional
requirements. Everything inferred rather than confirmed is tagged
`[ASSUMPTION]` inline and indexed in §11.

## 1. Vision

IZI Serwis repairs professional kitchen equipment. When a restaurant's combi
oven fails at 11am, the kitchen stops earning, and the owner reaches for a
phone and a search box. The company that appears first, looks credible, and can
be called in one tap wins the job.

Today IZI's site cannot win that moment. It is a WordPress build whose page
titles already target exactly the right queries — `Serwis pieców Warszawa`,
`Serwis zmywarek Warszawa` — while the site itself never tells Google a local
business stands behind them, buries those pages two clicks deep, and ships 244
images without a single `alt` attribute.

This rebuild keeps everything the legacy site earns and replaces everything
underneath it. Content moves into a CMS the client can operate. Accessibility
and structured data become properties of the content model rather than tasks in
a backlog. The result is a site where publishing a new equipment page in a new
city is a content entry, not a development ticket.

## 2. Target User

### 2.1 Jobs To Be Done

- **When my oven dies mid-service**, I want to reach a technician in seconds,
  so I can stop losing covers.
- **When I'm comparing service providers for a contract**, I want proof of
  coverage and manufacturer authorization, so I can defend the choice
  internally.
- **When I use a screen reader**, I want to navigate and submit the contact
  form, so I can request service without calling.
- **When I need to correct a price list or a brand logo**, I want to publish it
  myself, so I don't wait on a developer.

### 2.2 Non-Users (v1)

- Consumers with domestic appliances. IZI services professional HoReCa
  equipment only.
- Non-Polish speakers. The site is Polish-only in v1, though the content model
  must not preclude a second locale.

### 2.3 Key User Journeys

- **UJ-1. Marek calls before he finishes reading.**
  Marek runs a 60-cover bistro in Praga-Południe. His Convotherm throws an
  error mid-lunch. He searches `serwis pieców warszawa` on his phone. IZI is in
  the results with a rating-eligible local listing. He taps through to the
  combi-oven page, sees `Convotherm — autoryzowany serwis` and a phone number
  fixed to the top of the viewport, and taps it. **Climax:** the call connects
  without him having scrolled once. **Resolution:** he is on the phone with a
  dispatcher while the page is still loading images below the fold.

- **UJ-2. Ilona builds a shortlist she has to justify.**
  Ilona is procurement lead for a four-hotel group. She is not in a hurry; she
  is assembling a comparison. She lands on the homepage from a Google search
  for `serwis gastronomiczny umowa serwisowa`, reads the coverage page, checks
  which brands IZI is *authorized* for versus merely services, and submits the
  contact form selecting `Mazowieckie`. **Climax:** the form routes to the
  Mazowieckie advisor rather than a general inbox, and she gets a named reply.
  **Edge case:** if she selects a voivodeship with no assigned advisor, the
  form must still deliver, falling back to `biuro@iziserwis.pl`, and must never
  silently drop.

- **UJ-3. Piotr, using a screen reader, requests a service visit.**
  Piotr manages a hotel kitchen and is blind. He tabs through the contact form.
  Every field announces its label and its required state. The voivodeship
  select is a native control. On submit, the success message moves focus and is
  announced. **Climax:** he knows the form submitted without sighted
  confirmation. **Edge case:** on validation failure, focus moves to the first
  invalid field and the error is announced, not merely coloured red.

- **UJ-4. Ewa publishes a new brand without a developer.**
  Ewa handles IZI's marketing. A new authorization comes through for
  Winterhalter. She opens the CMS, adds a brand entry, uploads the logo — and
  the form will not save until she writes alt text. She marks it
  `authorized: true` and publishes. **Climax:** the brand wall and the
  `Marki naprawianego sprzętu` page both update, and the brand appears in the
  authorized group rather than the partner group. **Resolution:** no deploy
  happened.

## 3. Glossary

- **Service** — a thing IZI does: emergency repair, periodic inspection,
  installation/deinstallation. One of four today. Rendered as a page; carries
  `Service` structured data.
- **Equipment category** — a class of machine IZI repairs: combi ovens,
  dishwashers, coffee and bar equipment, refrigeration, heating. Five today.
  Each is a page targeting one local commercial query.
- **Brand** — a manufacturer. Each brand is either **authorized** (IZI is an
  official service partner and/or distributor) or **partner** (IZI services it
  without authorization). The distinction is legal and must never be blurred in
  the UI.
- **Brand landing page** — a dedicated page for a single brand. Four exist:
  Unic, Stalgast, Firex, Convotherm. These are commercial money pages.
- **Voivodeship** — one of Poland's 16 administrative regions. The contact form
  routes by voivodeship to a regional advisor e-mail.
- **Knowledge centre** — `/centrum-wiedzy/`, a single page of FAQ entries in 13
  topic groups.
- **Media** — an uploaded image. Always carries **alt text**; the CMS does not
  permit media without it.
- **Stat** — a numeric claim displayed on the site (`10+ lat`, `24h`). Every
  stat carries a **source** field; a stat without a source cannot be published.

## 4. Features

### 4.1 Content management

**Description.** Payload CMS, mounted as a route inside the same Next.js
application and backed by the same Supabase Postgres. Editors manage pages,
services, equipment categories, brands, FAQ entries, stats and media. Realizes
UJ-4.

The content model is where this project fixes the legacy site's defining
defect. Media without alt text is not a lint warning to be triaged later; it is
a save that fails.

**Functional Requirements:**

#### FR-1: Media requires alt text

An editor cannot persist a media record whose `alt` field is empty. Realizes
UJ-4.

**Consequences (testable):**
- Saving a media record with `alt` empty or whitespace-only returns a
  validation error and does not write.
- The API rejects the same payload with a 400, independent of the admin UI.
- Every rendered `<img>` in the front-end sources its `alt` from this field.
- A decorative image is expressed by an explicit `decorative: true` flag that
  renders `alt=""`, not by leaving `alt` blank.

#### FR-2: Brand authorization is modelled, not implied

An editor sets `authorized: boolean` on every brand. Realizes UJ-2, UJ-4.

**Consequences (testable):**
- The brand wall renders authorized and partner brands in separately labelled
  groups.
- A brand cannot be rendered in the authorized group unless `authorized` is
  true.
- Changing the flag updates every surface that lists brands without a deploy.

#### FR-3: Stats require a source

An editor cannot publish a stat without a non-empty `source` field.

**Consequences (testable):**
- Saving a stat with an empty `source` returns a validation error.
- `source` is not rendered to the public page; it exists so that no unsourced
  number can reach production.

*Rationale: the design reference asserts `5000+ napraw`, `15+ lat`, `24h`,
`100%`. The live site says `10+ lat`. No figure has a source. See §9 OQ-4.*

#### FR-4: Editors publish without a developer

An editor with the `editor` role can create, edit, draft, preview and publish
any content type. Realizes UJ-4.

**Consequences (testable):**
- Publishing a change updates the public page without a deployment.
- Drafts are not publicly reachable.
- An `editor` cannot alter the schema, users, or roles; an `admin` can.

**Feature-specific NFRs:**
- The CMS route is not indexable: `noindex` plus a `Disallow` in `robots.txt`.
- Admin authentication is required for every CMS route, enforced server-side.

### 4.2 Accessibility

**Description.** WCAG 2.2 Level AA, verified rather than asserted. Treated as a
functional requirement because the legacy site's failure here is the single
largest defect this project exists to fix. Realizes UJ-3.

**Functional Requirements:**

#### FR-5: Every page passes automated accessibility checks

Each page in the sitemap returns zero violations from an automated axe-core
scan at WCAG 2.2 A and AA. Realizes UJ-3.

**Consequences (testable):**
- CI fails the build on any Level A or AA violation.
- The scan runs against the rendered page, not the source.

#### FR-6: Colour meets contrast at the token level

Every foreground/background pair defined in the design system meets 4.5:1 for
normal text, 3:1 for large text and non-text UI.

**Consequences (testable):**
- A unit test asserts the contrast ratio of every token pair the design system
  permits.
- `brand-green` `#419D45` is not usable as a background under normal-weight
  text; `action-green` `#38863B` is. The test enforces this.
- The hero `<h1>` over photography meets 4.5:1 via a scrim, measured against
  the darkest region of the image behind the text.

#### FR-7: The contact form is fully operable without sight or a mouse

A user completes and submits the contact form using only a keyboard, and using
only a screen reader. Realizes UJ-3.

**Consequences (testable):**
- Every input has a programmatically associated label.
- Required fields expose `aria-required`; invalid fields expose
  `aria-invalid` and reference their error message via `aria-describedby`.
- On validation failure, focus moves to the first invalid field.
- On success, the confirmation is announced via a live region and receives
  focus.
- Focus order follows visual order; no positive `tabindex`.
- Focus is visible on every interactive element against every background it
  appears on.

#### FR-8: The site is navigable by keyboard end to end

**Consequences (testable):**
- A skip link is the first focusable element and moves focus to `<main>`.
- No keyboard trap exists on any page.
- Any disclosure (mobile menu, FAQ accordion) is operable by `Enter`/`Space`
  and closes on `Escape`, returning focus to its trigger.

### 4.3 Search visibility

**Description.** The legacy site's metadata is an asset; its structured data is
wrong. This feature preserves the first and rebuilds the second, generating
schema from CMS content rather than hand-authoring it in templates. Realizes
UJ-1, UJ-2.

**Functional Requirements:**

#### FR-9: All legacy URLs resolve

Every one of the 22 URLs in the legacy `page-sitemap.xml` returns 200 or 301.

**Consequences (testable):**
- A test enumerates all 22 legacy paths and asserts each resolves without a 404.
- `/uslugi/serwis-conovtherm/` 301s to `/uslugi/serwis-convotherm/` (the legacy
  path is a typo for Convotherm and is already indexed).
- `/uslugi/jakie-uslugi-swiadczymy/instalacji-i-deinstalacje/` 301s to
  `…/instalacje-i-deinstalacje/`.
- Every redirect is a single hop. No chains.

#### FR-10: Hand-written metadata is preserved verbatim

Each ported page carries the exact `<title>` and meta description recorded in
the [content inventory](../../../source/content-inventory.md).

**Consequences (testable):**
- A test asserts title and description equality against the inventory for all
  22 pages.
- No two pages share a title or a description.
- Every page has exactly one `<h1>`. *(Two legacy pages have none.)*
- Every page has a self-referencing canonical.

#### FR-11: The site declares itself a local business

The site emits one `LocalBusiness` node carrying IZI's name, address (ul.
Urocza 26, 04-651 Warszawa), phone, opening hours, and NIP. Realizes UJ-1.

**Consequences (testable):**
- The emitted JSON-LD validates against Schema.org and Google's Rich Results
  requirements for `LocalBusiness`.
- `openingHours` reflects the CMS value, not a hard-coded string.
- No page emits `Article` or `Person` schema. *(The legacy site emits both, via
  Rank Math defaults.)*

#### FR-12: Services and equipment categories emit Service schema

Each service page and each equipment-category page emits `Service` structured
data generated from its CMS entry.

**Consequences (testable):**
- `provider` references the `LocalBusiness` node.
- `areaServed` is generated from the coverage content, not hard-coded.
- The knowledge centre emits `FAQPage` schema generated from its FAQ entries.
- Every page below the root emits `BreadcrumbList`.

#### FR-13: Equipment pages are one click from the homepage

The five equipment-category pages are reachable from a top-level navigation
item. Realizes UJ-1.

**Consequences (testable):**
- Click depth from `/` to any equipment page is 1.
- If the URLs move from `/uslugi/co-naprawiamy/*` to `/urzadzenia/*`, each old
  path 301s to its new one.

**Notes:** `[NOTE FOR PM]` — moving these five URLs trades short-term ranking
turbulence for long-term structure. They are the site's most valuable pages.
This should be a conscious client decision, not a side effect of the navigation
redesign. See §9 OQ-6.

### 4.4 Contact and lead capture

**Description.** The contact form is the site's conversion event. Its
voivodeship routing is real business logic. Realizes UJ-2, UJ-3.

**Functional Requirements:**

#### FR-14: Contact submissions route by voivodeship

A visitor selects one of 16 voivodeships; the submission is delivered to the
advisor e-mail mapped to it. Realizes UJ-2.

**Consequences (testable):**
- The voivodeship→e-mail mapping is CMS content, editable without a deploy.
- A voivodeship with no mapped advisor falls back to `biuro@iziserwis.pl`.
- Every submission is persisted before the e-mail is dispatched, so a mail
  failure never loses a lead.
- The submitter receives an on-page confirmation only after persistence
  succeeds.

#### FR-15: The phone number is reachable in one tap on mobile

Realizes UJ-1.

**Consequences (testable):**
- A `tel:` link to `+48786631714` is present in the header on every page and
  is within the initial mobile viewport without scrolling.
- Its touch target is at least 44×44 CSS pixels (WCAG 2.5.8).

#### FR-16: Submissions are protected from spam without a CAPTCHA that excludes users

**Consequences (testable):**
- Rate limiting is enforced server-side per IP.
- If a challenge is used, it does not rely on visual perception alone.
  `[ASSUMPTION: a honeypot plus server-side rate limiting suffices at this
  traffic volume; no CAPTCHA in v1.]`

### 4.5 Analytics and measurement

#### FR-17: Analytics are configurable without a deploy

**Consequences (testable):**
- GTM is installed; GA4 is configured through it, not hard-coded.
  *(The legacy site hard-codes gtag with `G-99MVR70KRC`.)*
- No analytics or marketing tag fires before consent is granted.
- Phone-link taps and contact-form submissions are tracked as conversion events.

#### FR-18: A ranking baseline is captured before launch

**Consequences (testable):**
- Search Console is verified for the property and its position data for the
  five equipment queries is exported and stored in `docs/` before cutover.
- Without this, no post-launch claim about SEO impact is falsifiable. See §9
  OQ-2.

### 4.6 Sales and distribution path

**Description.** The business sells and distributes equipment, not only
services it — stated on five legacy pages (*"autoryzowany serwis i
dystrybutor"*, *"doradztwo w doborze sprzętu"*) and confirmed by the client.
Added 2026-07-10 after the gap analysis
([gap-analysis-sales-2026-07-10.md](../../analysis/gap-analysis-sales-2026-07-10.md)).
Quote-driven in v1; no catalog, no e-commerce (see OQ-10).

**Functional Requirements:**

#### FR-19: A buyer has a path

A visitor who wants to buy or be advised on equipment can find the offer and
submit an enquiry.

**Consequences (testable):**
- A "Dobór i sprzedaż sprzętu" service page exists and is reachable from the
  services listing (it is a `Service` entry, not a new template).
- The contact form's topic list includes `Zakup / dobór sprzętu`, persisted on
  the lead like every other topic.
- Brands carry a `distributor: boolean` distinct from `authorized` — the
  legacy wording *"serwisowym i/lub dystrybutorem"* proves the sets differ. A
  brand renders a distribution badge only when the flag is true. The flag is
  seeded `false` for every brand until the client answers OQ-11; the UI must
  therefore degrade gracefully when no brand carries it.

#### FR-20: Social proof is restored

The "Zaufali nam" client-logo block from the legacy homepage returns.

**Consequences (testable):**
- The block renders the client's own logo assets (NBP, Grycan, Nice To Fit
  You, CFI Hotels, Hotel Afrodyta, Arigator, Dziurka od Klucza, Santorini)
  with meaningful alt text on every logo.
- The claim text is the legacy site's own (*"znane restauracje i hotele, jak i
  duże instytucje publiczne"*), not invented.
- Pending OQ-12 (permission confirmation) — flagged in code, shippable
  content since the client already publishes these logos on the same domain.

## 5. Cross-Cutting NFRs

- **Performance.** Core Web Vitals in the green for mobile field data: LCP
  ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. Images served as AVIF or WebP with
  dimensions set. *(The legacy homepage ships 119 KB of HTML, 20 stylesheets,
  16 scripts, and 244 unoptimized PNG/JPEG images.)*
- **Rendering.** Every public page is server-rendered and complete without
  JavaScript for content and navigation.
- **Privacy.** Cookie consent gates all non-essential storage. Contact
  submissions are personal data under GDPR; retention is defined and enforced.
  `[ASSUMPTION: 24 months, matching the existing cookie policy's posture — the
  client has not specified.]`
- **Localisation.** Polish is the only locale in v1. No copy is hard-coded in
  templates; the content model supports a second locale without migration.
- **Security.** The CMS route requires authentication server-side. Supabase RLS
  denies by default. No service-role key reaches the browser.

## 6. Non-Goals (Explicit)

- We are not building a booking or payment system.
- We are not building a customer portal or ticket tracker.
- We are not migrating WordPress content programmatically. There are 22 pages;
  they are entered by hand, which is also the content review.
- We are not rewriting the meta titles and descriptions. They rank. See FR-10.
- We are not becoming a multi-locale site in v1.

## 7. MVP Scope

### 7.1 In Scope

- All 22 legacy pages, ported with metadata intact
- Payload CMS covering pages, services, equipment categories, brands, FAQ
  entries, stats, media, voivodeship routing
- Contact form with voivodeship routing and persistence
- Sales enquiry path: "Dobór i sprzedaż" service page, form topic,
  `distributor` brand flag (FR-19); "Zaufali nam" social proof (FR-20)
- `LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList` structured data
- GTM, GA4, Search Console, cookie consent
- Redirect map
- WCAG 2.2 AA, verified in CI
- Polish only

### 7.2 Out of Scope for MVP

- **`Realizacje` / case studies.** The design reference's navigation includes
  it; the content type does not exist and no case studies have been written.
  `[NOTE FOR PM]` — the client may believe this is in scope because it is in
  the mockup.
- **A blog.** The knowledge centre stays one FAQ page. This blocks the content
  model: it decides whether a post type exists at all. See §9 OQ-3.
- **Per-region landing pages** (`serwis pieców Kraków`). Deferred, but the
  content model must not preclude them — this is the growth thesis.
- **A second locale.**

## 8. Success Metrics

**Primary**

- **SM-1**: Organic conversions — `tel:` taps plus contact-form submissions
  attributable to organic search, measured in GA4. Target: exceed the
  pre-launch baseline within one quarter. Validates FR-14, FR-15, FR-17.
- **SM-2**: Average Search Console position for the five equipment queries. No
  regression versus the pre-launch baseline at 30 days; improvement at 90.
  Validates FR-9, FR-10, FR-11, FR-12, FR-13.

**Secondary**

- **SM-3**: Zero axe-core violations at WCAG 2.2 A and AA across the sitemap,
  plus a passing manual keyboard and screen-reader run of the contact form.
  Validates FR-5, FR-6, FR-7, FR-8.
- **SM-4**: Core Web Vitals in the green for mobile field data at 28 days.
- **SM-5**: The client publishes a content change without developer
  involvement within one week of handover. Validates FR-4.
- **SM-6**: Zero 404s across the 22 legacy paths, verified in CI. Validates
  FR-9.

**Counter-metrics (do not optimize)**

- **SM-C1**: Time on page. Counterbalances SM-1. A visitor whose oven is broken
  should call in fifteen seconds. Rising time on page is a failure of UJ-1, not
  engagement.
- **SM-C2**: Total page count. Counterbalances SM-2. Programmatic per-region
  pages can lift impressions while diluting quality; growth must come from
  pages a human would want to read.

## 9. Open Questions

These block the content model or the copy. They belong to the client.

1. **OQ-1 — Warszawa or all of Poland?** The live site claims nationwide
   coverage across 16 voivodeships. The design reference says `Warszawa i
   okolice`. Every meta title targets `… Warszawa`. This tension predates the
   redesign. It determines `areaServed` in FR-12 and the entire per-region
   growth thesis.
2. **OQ-2 — Is Search Console verified?** FR-18 depends on it. Without a
   baseline, SM-2 is unmeasurable.
3. **OQ-3 — Does the knowledge centre become a blog?** Blocks the content
   model. Must be answered before schema is frozen.
4. **OQ-4 — What are the real stats?** `5000+ napraw`, `15+ lat`, `24h czas
   reakcji`, `100% oryginalne części` all come from an AI-generated mockup. The
   live site says `10+ lat`. FR-3 prevents publication without a source.
5. **OQ-5 — Is `24/7` true?** The reference badge says `SERWIS 24/7` and
   `Serwis 7 dni w tygodniu`. The contact page says Mon–Fri 08:00–17:00, with
   *selected* after-hours faults on request. Shipping the former is a
   false-advertising exposure that contradicts a page one click away, and it
   would make `openingHours` in FR-11 a lie in structured data.
6. **OQ-6 — Do the five equipment pages move to `/urzadzenia/*`?** See FR-13's
   note. They are the site's most valuable URLs.
7. **OQ-7 — The reference navigation drops `Obszar działania` and `Centrum
   wiedzy`.** Neither deletion looks deliberate. Confirm.
8. **OQ-8 — Which of the four brand landing pages actually convert?** Decides
   which templates get design attention first.
9. **OQ-9 — Contact-submission retention period?** Needed for GDPR compliance;
   assumed 24 months in §5.
10. **OQ-10 — Sales scope.** Quote-driven enquiries (built, FR-19) or a product
    catalog? Recommendation: no e-commerce in v1 — B2B equipment is
    quote-driven; a catalog without prices is maintenance burden without
    conversion evidence.
11. **OQ-11 — Which brands are distributed** (vs serviced-only)? Blocks setting
    `distributor` truthfully; all seeded `false` until answered.
12. **OQ-12 — Client-logo reuse permission** for the "Zaufali nam" block. The
    legacy site already publishes them; confirm anyway.
13. **OQ-13 — Parts supply** — standalone offer or a service detail?

## 10. Constraints

- **Supabase MCP is not authorized** in the current tooling session; OAuth
  cannot be completed from a non-interactive run. Provisioning the project and
  applying schema is blocked until the connector is authorized.
- **The design reference is a concept, not a spec.** Its copy invents facts and
  its primary green fails WCAG AA under white button text at 3.42:1. See the
  [reference analysis](../../../design/reference-analysis.md).

## 11. Assumptions Index

- **§2.3 / UJ-2** — that a procurement persona exists at all. Plausible given
  the region-routed contact form and the `wspieramy gastronomię w każdej skali`
  framing; not confirmed by the client.
- **§4.4 / FR-16** — that a honeypot plus server-side rate limiting suffices at
  this traffic volume, and no CAPTCHA is needed in v1.
- **§5** — that contact-submission retention is 24 months. Unspecified by the
  client. See OQ-9.
- **§4.3 / FR-9** — that `/uslugi/serwis-convotherm/` and
  `…/instalacje-i-deinstalacje/` are the desired corrected slugs. The
  corrections are unambiguous; the decision to make them is not.
