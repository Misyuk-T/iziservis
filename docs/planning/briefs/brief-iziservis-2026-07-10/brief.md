---
title: "Product Brief: iziserwis.pl redesign"
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# Product Brief: iziserwis.pl redesign

## Executive Summary

IZI Serwis repairs and maintains professional kitchen equipment — combi ovens,
dishwashers, coffee machines, refrigeration — for restaurants and catering
businesses across Poland. When a restaurant's oven dies at 11am, the kitchen
stops earning. Speed of response *is* the product.

Their website does not reflect that. It is a WordPress build that loads 20
stylesheets and 16 scripts on the homepage, serves every image as unoptimized
PNG or JPEG, tells Google it publishes `Article`s written by a `Person` rather
than that it is a local business in Warsaw, and ships 244 images without a
single `alt` attribute. The last of those is simultaneously the site's largest
accessibility failure and a wholly unclaimed ranking signal.

This project rebuilds the site on a modern stack — Next.js front-end, Payload
CMS mounted as a route, Supabase Postgres underneath — with accessibility and
SEO as build-time requirements rather than a follow-up audit. The content, URLs
and hand-written metadata that already earn traffic are preserved exactly. What
changes is everything underneath them, plus a visual identity that looks like a
company you would trust with a €15,000 oven.

## The Problem

Three problems, stacked.

**The site cannot be edited.** Content changes require a developer. There is no
separation between what the company says and how the company's site is built,
so the marketing copy has calcified. `/centrum-wiedzy/` — the entire FAQ, 13
topic groups deep — is one hand-maintained page.

**The site is invisible to the searches it should own.** Every page title
already targets a local commercial query: `Serwis ekspresów Warszawa`, `Serwis
zmywarek Warszawa`, `Serwis pieców Warszawa`. But the site never tells Google a
local business is behind them. There is no `LocalBusiness` schema, no `Service`
markup on service pages. Two pages have no `<h1>` at all. The five pages that
target those queries sit two clicks deep under `Usługi → Co naprawiamy?`.

**The site excludes users and leaks ranking.** 244 images, zero alt text. This
fails WCAG 1.1.1 at Level A — not an edge case, the most basic criterion there
is. Screen-reader users cannot navigate it, and Google is handed no signal
about what any image depicts. The homepage `<h1>` is white text over an
unfiltered kitchen photograph, failing contrast at 1.4.3.

The cost of the status quo is measurable in a way most redesigns aren't: this
is a business whose customers search `serwis pieców warszawa` in a panic, and
whose site is structurally prevented from winning that search.

## The Solution

A rebuild in three parts.

**A front-end that is fast and accessible by construction.** Server-rendered
Next.js, images in modern formats, a design system whose colour tokens are
contrast-checked before they are named. The reference concept's own primary
green already fails AA under white button text at 3.42:1 — corrected to
`#38863B` at the same hue. Accessibility here is not a phase; it is the palette.

**A CMS the client can actually use.** Payload, mounted as a route inside the
same Next.js app, backed by the same Supabase Postgres. Editors get drafts,
versions, media management and roles without any of it being hand-built. Media
carries a **required** `alt` field: the site's single largest defect becomes a
thing the content model will not permit.

**SEO modelled as content, not markup.** One `LocalBusiness` node for the
company. `Service` schema per service page, generated from the same data that
renders the page. `FAQPage` schema over the knowledge centre. All 22 existing
URLs preserved; the two that must change (`serwis-conovtherm`, a typo for
Convotherm, and `instalacji-i-deinstalacje`, ungrammatical Polish) ship with
301s. GA4 and Search Console wired in, GTM in front so future tag changes are
not code deploys.

## What Makes This Different

Honestly: nothing about the technology is novel. Next.js and Payload on
Postgres is a conventional 2026 choice, and that is the point — this is a
service company's brochure site, not a platform.

What differentiates the *project* is that the discovery was done before the
design. The legacy site was crawled in full and recorded before a line was
written, so the redesign cannot silently drop content, URLs, or the
hand-written metadata that already ranks. Most redesigns of a site this size
regenerate the copy and lose six months of position. This one treats the
existing meta titles as an asset and carries them over verbatim.

The unfair advantage is that IZI is an **authorized** service partner for
Bartscher, Convotherm, Electrolux Professional, Hobart, Astoria and Unic. That
is a legal distinction from the brands they merely service, it is a genuine
trust moat, and the current site is careful about it. The new site must be too.

## Who This Serves

**The restaurant owner or kitchen manager with a broken machine.** Searching on
a phone, mid-service, in a hurry. Needs one thing: evidence someone will show
up, and a way to call them in under five seconds. Success is a phone call.

**The procurement lead at a hotel or catering group.** Evaluating a service
contract, not an emergency. Needs proof of coverage, authorizations, and
references. Success is a quote request. `[ASSUMPTION]` — plausible given the
region-routed contact form and the "wspieramy gastronomię w każdej skali"
framing, but not confirmed by the client.

**The IZI content editor.** Non-technical. Needs to publish a new service page
or update a brand list without a developer, and must not be able to publish an
image without alt text.

## Success Criteria

Ordered by how directly they serve the business.

- **Phone calls and quote-form submissions from organic search**, tracked in
  GA4. This is the business metric; everything below is a proxy for it.
- **Ranking for the five equipment queries** the site already targets
  (`serwis pieców/zmywarek/ekspresów/lodówek/urządzeń grzewczych Warszawa`).
  Baseline must be captured from Search Console **before** launch.
- **Zero WCAG 2.2 Level A/AA violations** on automated axe scans, plus a
  manual keyboard and screen-reader pass over the contact form.
- **Core Web Vitals in the green** for mobile field data.
- **No URL regressions.** All 22 legacy paths resolve 200 or 301.
- **The client publishes a content change without a developer** within the
  first week after handover.

## Scope

**In, for v1:**

- All 22 existing pages, ported with their metadata intact
- Payload CMS on a separate route, with a content model covering pages,
  services, equipment categories, brands (with `authorized: boolean`), FAQ
  entries, and media with required alt
- Contact form with the existing 16-voivodeship e-mail routing — this is real
  business logic, not decoration
- `LocalBusiness`, `Service`, `FAQPage` and `BreadcrumbList` structured data
- GA4 + Search Console + GTM
- Redirect map for the two renamed URLs
- Polish only, but the content model must not hard-code a single locale

**Explicitly out of v1:**

- `Realizacje` / case studies. The reference concept's navigation includes it;
  the content type does not exist and no case studies have been written.
- A blog. `/centrum-wiedzy/` stays a single FAQ page until the client says
  otherwise. **Open question** — this decides whether the CMS needs a post type
  at all, so it must be answered before the content model is frozen.
- Per-region landing pages. A plausible SEO expansion, deliberately deferred;
  the content model should not preclude it.
- Any online booking or payment.

## Open Questions

These block the content model or the copy. They are the client's to answer.

1. **Warszawa or all of Poland?** The live site says nationwide, with contacts
   routed across 16 voivodeships. The reference concept says `Warszawa i
   okolice`. Every meta title says `… Warszawa`. This tension predates the
   redesign and needs a decision, not a default.
2. **Is Search Console verified?** Without it there is no ranking baseline, and
   no way to prove the redesign did not cost anything.
3. **Does `/centrum-wiedzy/` become a blog?**
4. **Where do the stats come from?** The reference asserts `5000+ napraw`,
   `15+ lat doświadczenia`, `24h czas reakcji`, `100% oryginalne części`. The
   live site says `10+ lat`. No figure has a source. None ships without one.
5. **Is `24/7` true?** The reference badge says `SERWIS 24/7` and `Serwis 7 dni
   w tygodniu`. The contact page says Mon–Fri 08:00–17:00, with *selected*
   after-hours faults handled on request. Shipping the former is a
   false-advertising exposure that contradicts a page one click away.

## Vision

Own the Polish-language search results for professional kitchen equipment
repair, one equipment category and one region at a time. The content model is
built so a `serwis pieców Kraków` page is a content entry, not a development
ticket — which is what turns a five-page SEO win into a defensible national
position over two or three years.
