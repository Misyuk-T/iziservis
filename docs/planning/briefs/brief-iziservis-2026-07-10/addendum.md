---
title: "Brief addendum: iziserwis.pl redesign"
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# Brief addendum

Depth that belongs downstream (PRD, architecture) rather than in the brief.

## CMS: options considered

| Option | Why not |
|---|---|
| **Payload, mounted in Next.js, on Supabase Postgres** | **Chosen.** Admin, drafts, versions, media, roles, REST/GraphQL out of the box. Content lives in the same Postgres as everything else. Schema-as-code means `alt` can be made required at the model level. |
| Hand-rolled admin on `supabase-js` + RLS | Maximum control, but months of work reimplementing drafts, versioning, media pipeline and role management — all of which Payload ships. No compensating benefit for a 22-page brochure site. |
| External SaaS (Sanity, Contentful) | Fast start, good DX, but content splits across two systems and adds a recurring bill. The client already needs Supabase for the contact form; a second data home is a liability, not a feature. |

## Legacy stack, recorded

WordPress. Custom theme `izi`, Gutenberg with the Getwid and carousel-block
plugins, Contact Form 7 for the contact form, Rank Math for SEO, Easy Table of
Contents. GA4 (`G-99MVR70KRC`) hard-coded via gtag; no GTM container, so every
tag change is a deploy today.

Homepage: 119 KB of HTML, 20 stylesheets, 16 scripts. 244 image references
across the site, all PNG or JPEG, no WebP or AVIF anywhere.

Built by prodesigner.pl (`hello@prodesigner.pl` in the markup).

## What the legacy site already does right

Do not regenerate these.

- Meta titles and descriptions are hand-written per page. **Zero duplicates**
  across 22 pages.
- The five equipment pages already target their local commercial query.
- Canonicals present and correct on every page.
- `BreadcrumbList` schema on inner pages.
- URL structure is clean, hierarchical, Polish-language.

## URL preservation

All 22 paths must resolve. Two need renaming *with* 301s, because both are
already indexed:

| Legacy | Problem | Proposed |
|---|---|---|
| `/uslugi/serwis-conovtherm/` | Typo — the brand is **Convotherm** | `/uslugi/serwis-convotherm/` |
| `/uslugi/jakie-uslugi-swiadczymy/instalacji-i-deinstalacje/` | Ungrammatical Polish | `…/instalacje-i-deinstalacje/` |

Promoting the five equipment pages from `/uslugi/co-naprawiamy/*` to a
top-level `/urzadzenia/*` — as the design reference's navigation implies —
would mean five more 301s. Worth doing for the click-depth win, but it is a
deliberate trade of short-term ranking turbulence for long-term structure, and
should be a conscious decision rather than a side effect of the nav redesign.

## Business facts (verified against the live site)

| | |
|---|---|
| Legal name | IZI Serwis |
| Address | ul. Urocza 26, 04-651 Warszawa |
| NIP | 5272796292 |
| REGON | 523058150 |
| Phone | +48 786 631 714 |
| Hours | Mon–Fri 08:00–17:00; selected faults handled after hours on request |
| General e-mail | biuro@iziserwis.pl |
| Coverage | All of Poland; contact e-mail routed per voivodeship (16) |
| Experience claimed | `10+ lat praktyki w branży HoReCa` |

**Authorized service and/or distribution:** Bartscher, Convotherm, Electrolux
Professional, Hobart, Astoria, Unic.

**Partner brands (serviced, not authorized):** Rational, others.

The authorized/partner distinction is legal. The brand model needs an
`authorized: boolean`, and the UI must not blur the two.

Four brands have dedicated landing pages — Unic, Stalgast, Firex, Convotherm.
These are commercial money pages.

## Design reference: where it diverges from reality

The reference is AI-generated, so its copy invents facts.

| Reference claims | Reality |
|---|---|
| `+48 572 278 600` | `+48 786 631 714` |
| `SERWIS 24/7`, `Serwis 7 dni w tygodniu` | Mon–Fri 08:00–17:00 |
| `15+ lat doświadczenia` | `10+ lat` |
| `Warszawa i okolice` | Nationwide, 16 voivodeships |
| `5000+ napraw` | No source |
| Winterhalter, Fagor, Redfox, RM Gastro logos | Not currently listed as serviced |
| Rational shown most prominently | Rational is a *partner*, not an authorized brand |

## Colour tokens

Sampled from the reference, corrected for contrast. Hue 122.6°, saturation
held; only lightness moves.

| Token | Hex | Contrast | Use |
|---|---|---|---|
| `green-900` | `#022114` | white on it: 17.07:1 | Hero background |
| `green-800` | `#042315` | white on it: 16.71:1 | Dark cards |
| `green-700` | `#09311D` | white on it: 14.42:1 | Trust-bar band |
| `brand-green` | `#419D45` | 3.42:1 on white | Logo, large accents, icons, borders — **never** small text |
| `action-green` | `#38863B` | 4.52:1 on white | Button fill under white text |
| `link-green` | `#2A652D` | 7.01:1 on white | Green text on white (AAA) |

`#419D45` under white button text measures 3.42:1 and fails WCAG AA for normal
text. It is the primary CTA. This is the same class of defect the legacy site
already has; it must not be rebuilt.

## Navigation delta

| Reference | Current site | Note |
|---|---|---|
| Usługi | Usługi | — |
| Urządzenia | under `Usługi → Co naprawiamy?` | Promotion is a good SEO move |
| O nas | O firmie | Rename only |
| Realizacje | — | **Content type does not exist** |
| Kontakt | Kontakt | — |
| — | Obszar działania | Reference **drops** it |
| — | Centrum wiedzy | Reference **drops** the entire FAQ |

Neither deletion looks deliberate.

## Content model implications

- Media: `alt` required at the schema level.
- Brands: `authorized: boolean`.
- Stats row: content, not markup — figures change, and each needs a source
  field so an unsourced number cannot be published.
- Trust-bar items, hero badge, CTA labels: editable content.
- Services and equipment categories carry their own `Service` schema fields.
- No hard-coded locale, so per-region pages remain possible.

## Environment constraint

Supabase MCP is not authorized in the current session and OAuth cannot be
completed from here. Provisioning the project and applying schema is blocked
until the connector is authorized via claude.ai connector settings or
`claude mcp` in an interactive terminal.
