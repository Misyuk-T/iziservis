# Design reference v2 — light hero

Source: [homepage-reference-v2.png](homepage-reference-v2.png), supplied
2026-07-10. Supersedes the *visual direction* of
[homepage-reference.png](homepage-reference.png); the factual caveats in
[reference-analysis.md](reference-analysis.md) all still apply — see below.

## What changes visually

The v1 concept was a dark-green hero. V2 flips it light:

1. **Hero on the page canvas** (`#FEFEFE` — identical to our `--color-page`).
   Headline in near-black with the accent word in green, badge as a
   green-outlined pill, photo of a professional kitchen in a **dome/arch mask**
   bleeding off the right edge behind the header.
2. **Floating trust card** — a white, bordered card overlapping the hero's
   bottom edge, four items with green outline icons.
3. **Brand logo wall** on white, real logos.
4. **Stats band** in a soft-bordered card.

## Palette mapping

Sampled from the image. Everything lands on existing tokens; no new colours.

| Sampled | Maps to | Note |
|---|---|---|
| `#FEFEFE` page bg | `--color-page` | identical |
| `#0C1018` headline | `--color-green-900` | ours is the brand's dark green; keep it |
| `#369637` accent | `--color-brand-green` | large display text only (3.4:1 on white — passes the 3:1 large-text bar, fails 4.5:1 body) |
| `#58AE5C` button | `--color-action-green` | the ref's button green fails AA under white text; ours is the corrected fill |

## Where v2 contradicts the business (again)

Same invented facts as v1, verbatim: `24/7` in the headline, `7 dni w
tygodniu`, phone `+48 572 278 600`, `Warszawa i okolice`, `15+ lat`,
`5000+ napraw`, `24h czas reakcji`. None ships; the live business is Mon–Fri
08:00–17:00, phone `+48 786 631 714`, nationwide. See PRD OQ-1/OQ-4/OQ-5.

New in v2's logo wall: **Winterhalter, Robot Coupe, REX Royal** — not listed as
serviced brands anywhere on the live site — and **“UNIK”**, which is a
misspelling of Unic (the reference generator even invented an Italian flag for
it). Rational is again the most prominent logo despite being a partner brand,
not an authorized one. The wall stays wordmarks until the client supplies real
logo files for the brands they actually service.

## Trust card content

The ref's four items are `Przyjedziemy do 24h` (unverified), `7 dni w tygodniu`
(false), `Gwarancja jakości` (vague), `Doświadczeni technicy` (fine). We keep
the card *form* with our three verified claims: regional advisor routing,
original parts / warranty preserved, emergency repairs + inspections.

## Photography

The project now carries the client's own photos, pulled from
iziserwis.pl/wp-content/uploads (their assets, no licensing question):

- `public/hero/serwis-ekspresu.jpg` — technician servicing an espresso machine,
  1200×1800. The hero shot: it is literally the service being sold.
- `public/hero/kuchnia-zespol.jpg` — kitchen crew, 1600×1068, spare.

Next/image serves AVIF/WebP from these automatically.
