# Design reference — homepage

Source: [homepage-reference.png](homepage-reference.png), an AI-generated
concept supplied by Taras. Treat it as **direction, not specification** — the
layout and palette are the brief; the copy and numbers in it are placeholder
and several of them contradict the real business (see below).

## Layout

Reading down the reference:

1. **Header** — white, logo left, five nav items centred, phone number and a
   `Wyceń naprawę` CTA right.
2. **Hero** — deep-green background, photo of a technician bleeding in from the
   right. A `SERWIS 24/7` pill badge, an `<h1>` with the last fragment in
   accent green, a service/location subline, two CTAs (solid + outline).
3. **Trust bar** — four icon+label pairs on a slightly lighter green band,
   sitting directly under the hero.
4. **Brand wall** — logo grid, 10 marks plus an "i wiele innych" cell.
5. **Stats row** — four figures in a bordered light card.
6. **Why-us card** — dark green panel, photo left, green-check list right, CTA.

The structure is conventional and sound for a local service business: proof of
availability above the fold, proof of competence immediately after.

## Palette

Sampled from the image, then corrected for contrast.

| Token | Hex | Use |
|---|---|---|
| `green-900` | `#022114` | Hero background, darkest surface |
| `green-800` | `#042315` | Dark cards |
| `green-700` | `#09311D` | Trust bar band |
| `brand-green` | `#419D45` | Brand mark, large accent text, icons, borders |
| `action-green` | `#38863B` | Button fill under white text |
| `link-green` | `#2A652D` | Green text on white |
| `white` | `#FEFEFE` | Page background |

**The reference's own green fails WCAG AA where it matters most.** White text
on `#419D45` measures 3.42:1; normal-weight body text needs 4.5:1. That is the
primary call-to-action button — `Zadzwoń teraz`, `Wyceń naprawę`, `Dowiedz się
więcej` — the single most important pixel on the page. Same problem for green
text or small green icons on white: 3.39:1.

Everything else in the reference clears AA comfortably: white on the hero green
is 17.07:1, the `24/7` accent on hero green is 4.99:1, white on the dark card
is 16.71:1.

The fix keeps the hue (122.6°) and saturation and only drops lightness:
`#38863B` reaches 4.52:1 against white, `#2A652D` reaches 7.01:1 (AAA). Keep
`#419D45` for what it is good at — the logo, the large `24/7` accent, icons and
borders, all of which only owe 3:1 as non-text UI.

This is exactly the class of defect the legacy site already has (see
[legacy-site-audit.md](../source/legacy-site-audit.md)); it should not be
rebuilt into the new one.

## Where the reference contradicts the business

The concept was generated, not briefed, so its copy invents facts. Checked
against the live site and the contact page:

| Reference claims | Reality |
|---|---|
| `+48 572 278 600` | `+48 786 631 714` |
| `SERWIS 24/7`, `Serwis 7 dni w tygodniu` | Mon–Fri 08:00–17:00; only *selected* faults handled after hours |
| `15+ lat doświadczenia` | The site says `10+ lat praktyki w branży HoReCa` |
| `Warszawa i okolice` | Nationwide — "Serwis dostępny w całej Polsce", contacts routed across 16 voivodeships |
| `5000+ napraw` | Unverified; no source anywhere on the site |
| Winterhalter, Fagor, Redfox, RM Gastro logos | Not listed among serviced brands today |
| Rational shown most prominently | Rational is a *partner* brand, not one IZI is authorized for |

Two of these are worth calling out beyond a copy fix. Shipping a **24/7** claim
against a Mon–Fri 08:00–17:00 operation is a false-advertising exposure, and it
directly contradicts the contact page one click away. And narrowing to
**"Warszawa i okolice"** would throw away the nationwide positioning the
current site is built on — although the meta titles all target `… Warszawa`,
so there is a real strategic tension here that predates the reference and needs
a decision, not a default.

Every figure in the stats row needs a source before it ships.

## Navigation

The reference proposes an IA that differs from what exists:

| Reference | Current site |
|---|---|
| Usługi | Usługi |
| Urządzenia | (lives under `Usługi → Co naprawiamy?`) |
| O nas | O firmie |
| Realizacje | — **does not exist** |
| Kontakt | Kontakt |
| — | Obszar działania (`gdzie-naprawiamy`) |
| — | Centrum wiedzy |

Promoting `Urządzenia` to top level is a good SEO move — those are the five
pages already targeting `Serwis pieców/zmywarek/ekspresów/lodówek Warszawa`,
and they are currently two clicks deep.

But `Realizacje` (case studies) is a **content type that does not exist yet**,
and the reference drops both `Obszar działania` and `Centrum wiedzy` — the
latter being the site's entire FAQ. Neither deletion looks deliberate. Flag
both to the client before modelling the CMS.

## What carries into the CMS model

- Media requires `alt`. Not optional, enforced at the schema level.
- The stats row is content, not markup — figures change.
- The brand wall needs an `authorized: boolean` field; the distinction between
  authorized service and partner brand is a legal one the current site is
  careful about.
- Trust-bar items, hero badge, and CTA labels are all editable content.
