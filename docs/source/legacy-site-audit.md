# Legacy site audit — iziserwis.pl

Captured 2026-07-10 by crawling the live site (22 pages, full sitemap).
Raw structured capture: [legacy-site-scrape.json](legacy-site-scrape.json).

This is the *as-is* record. It exists so the redesign does not silently drop
content, URLs, or ranking signals that the current site already earns.

## Business

IZI Serwis — servicing of professional catering / HoReCa kitchen equipment.
Repairs, periodic inspections, installs, emergency call-outs.

| | |
|---|---|
| Legal name | IZI Serwis |
| Address | ul. Urocza 26, 04-651 Warszawa |
| NIP | 5272796292 |
| REGON | 523058150 |
| Phone | +48 786 631 714 (Mon–Fri 08:00–17:00) |
| General e-mail | biuro@iziserwis.pl |
| Coverage | All of Poland; contact e-mail routed per voivodeship (16 regions) |
| Language | Polish only (`lang="pl-PL"`, no hreflang) |

Positioning leans on "10+ lat praktyki w branży HoReCa", nationwide coverage,
and authorized-service status. Site was built by prodesigner.pl
(`hello@prodesigner.pl` appears in the markup).

### Brands

Authorized service and/or distribution: Bartscher, Convotherm, Electrolux
Professional, Hobart, Astoria, Unic.

Partner brands (serviced, not authorized): Rational and others listed on
`/uslugi/jakie-uslugi-swiadczymy/marki-naprawianego-sprzetu/`.

Four brands have dedicated landing pages: Unic, Stalgast, Firex, Convotherm.
These are the commercial money pages — they must survive the redesign with
their URLs intact.

## Current stack

WordPress. Custom theme `izi`, Gutenberg blocks plus the Getwid and
carousel-block plugins, Contact Form 7 for the contact form, Rank Math for SEO,
Easy Table of Contents. GA4 is installed (`G-99MVR70KRC`) via gtag — there is
no GTM container.

The homepage ships 119 KB of HTML, 20 stylesheets and 16 scripts. Every image
is PNG or JPEG; no WebP or AVIF anywhere on the site.

## Information architecture

All 22 pages, exactly as they sit in `page-sitemap.xml`:

```
/
/o-firmie/
/uslugi/
  /uslugi/co-naprawiamy/
    /uslugi/co-naprawiamy/piece-konwekcyjno-parowe/
    /uslugi/co-naprawiamy/urzadzenia-grzewcze/
    /uslugi/co-naprawiamy/ekspresy-i-urzadzenia-barowe/
    /uslugi/co-naprawiamy/zmywarki-gastronomiczne/
    /uslugi/co-naprawiamy/urzadzenia-chlodnicze/
  /uslugi/jakie-uslugi-swiadczymy/
    /uslugi/jakie-uslugi-swiadczymy/przeglady-okresowe/
    /uslugi/jakie-uslugi-swiadczymy/naprawy-awaryjne/
    /uslugi/jakie-uslugi-swiadczymy/instalacji-i-deinstalacje/
    /uslugi/jakie-uslugi-swiadczymy/marki-naprawianego-sprzetu/
  /uslugi/gdzie-naprawiamy/
  /uslugi/serwis-unic/
  /uslugi/serwis-stalgast/
  /uslugi/serwis-firex/
  /uslugi/serwis-conovtherm/
/centrum-wiedzy/          (single FAQ page, 13 topic groups — not a blog)
/kontakt/
/polityka-cookies/
```

Two notes for the redesign. `serwis-conovtherm` is a **typo for Convotherm**
that is already indexed — it needs a redirect, not a silent rename. And
`instalacji-i-deinstalacje` is grammatically wrong Polish (should be
`instalacje-i-deinstalacje`); same call.

There is no blog. `/centrum-wiedzy/` is one long FAQ page covering: services,
availability, equipment types (combi ovens, dishwashers, heating, coffee
machines), brands, locations, client types, company, terms, contact. That
content is the natural seed for both a real FAQ schema and future articles.

## What is broken

Ordered by how much it costs the business.

**Every image on the site is missing an `alt` attribute.** All 22 pages, 0
alt text anywhere — 22 images on the homepage alone. This is simultaneously
the single largest accessibility failure (WCAG 1.1.1, a Level A criterion) and
a wholly unclaimed SEO signal. It is also the easiest thing on this list to
fix.

**No LocalBusiness structured data.** Rank Math emits the wrong shape: pages
are typed as `Article` with a `Person` author. For a Warsaw-based service
company chasing "serwis … Warszawa" queries, the correct schema is
`LocalBusiness` (or the narrower `HVACBusiness`) plus `Service` per service
page. Every page title already targets a local query and none of them tell
Google that a local business is behind it.

**Two pages have no `<h1>`.** `/kontakt/` and `/polityka-cookies/`. The cookies
page also has no meta description.

**No modern image formats.** 244 PNG/JPEG references across the site, zero
WebP/AVIF. Combined with 20 CSS files and 16 scripts on the homepage, this is
where the Core Web Vitals budget is going.

**Hero contrast.** The homepage `<h1>` is white text laid over a busy,
unfiltered kitchen photograph. Needs a scrim or overlay to clear WCAG 1.4.3
contrast at 4.5:1.

**GA4 without GTM.** Hard-coded gtag means every future tag change is a code
deploy. Search Console status is unverified — worth confirming the property is
even claimed.

### What is already right

Not everything needs replacing. Meta titles and descriptions are hand-written
per page and there are **no duplicates** across the 22 pages — the money pages
already target their local keyword (`Serwis ekspresów Warszawa`, `Serwis
zmywarek Warszawa`, `Serwis pieców Warszawa`, `Serwis lodówek Warszawa`).
Canonicals are present and correct. `BreadcrumbList` schema exists on inner
pages. The URL structure is clean, hierarchical, and Polish-language.

Carry these forward as-is. The redesign should not regenerate the meta copy.

## Redesign constraints this audit implies

1. **Preserve all 22 URLs.** Any change to `serwis-conovtherm` or
   `instalacji-i-deinstalacje` ships with a 301.
2. **Carry over the hand-written titles and descriptions** verbatim; they are
   an asset, not boilerplate.
3. **Content model must have an `alt` field that is required.** The single
   biggest defect on the current site is one the CMS should make impossible.
4. Every service page needs `Service` schema; the site needs one
   `LocalBusiness` node. Model this in the CMS, not in templates.
5. Region-to-e-mail routing (16 voivodeships) is real business logic on the
   contact form, not decoration.
6. Polish is the only language today, but per-region pages are a plausible SEO
   expansion — do not hard-code a single-locale content model.

## Open questions for the client

- Is Google Search Console actually verified for the property?
- Do they want the existing GA4 property carried over, or a fresh one behind GTM?
- Is `/centrum-wiedzy/` meant to grow into a blog? That decides whether the CMS
  needs a post type at all.
- Which of the four brand landing pages actually convert? That should drive
  which templates get design attention first.
