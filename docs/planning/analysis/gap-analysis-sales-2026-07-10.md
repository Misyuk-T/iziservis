# Gap analysis — the built site vs the actual business

Analyst pass, 2026-07-10. Trigger: the client states the company **also sells
equipment**, not only services it.

## The headline finding

The client told us nothing new. His own site says it on five pages — homepage
(*"autoryzowany serwis i dystrybutor"*), o-firmie, co-naprawiamy (*"bezpośredni
dostęp do części"*), the brands page (*"Autoryzowany serwis i dystrybucja"*),
and the FAQ (*"Czy pomagacie w doborze sprzętu? Tak…"*). Our own brief recorded
it: *"authorized service **and/or distribution**"*. We captured the fact and
then modelled the entire product around servicing only.

The business has (at least) three revenue lines. The site we built sells one:

| Revenue line | Evidence | Modelled? |
|---|---|---|
| Service (repairs, inspections, installs) | everywhere | ✅ fully |
| **Equipment sales / distribution + dobór** | 5 pages + FAQ | ❌ invisible |
| Parts (*"bezpośredni dostęp do części"*) | co-naprawiamy | ❌ invisible |
| Standing service contracts (*"umowa stałej obsługi"* — FAQ says yes) | FAQ | ❌ invisible |

## What the sales gap costs

Every CTA on the site is repair-shaped: *"Wyceń naprawę"*, *"Zadzwoń"*,
*"Coś się zepsuło?"*. A buyer equipping a new kitchen — the highest-ticket
visitor the site can receive — has no path: no page says "we sell and advise",
the contact form's topics (`Serwis / Przegląd / Wycena / Zapytanie ogólne`)
never mention buying, and the brand model cannot even express "we distribute
this brand" (one `authorized` flag conflates service authorization with
distribution — the legacy site says *"serwisowym **i/lub** dystrybutorem"*,
so the two do not coincide).

There is also a persona gap: the PRD's JTBD covers the broken-oven owner, the
procurement lead comparing service contracts, the screen-reader user, and the
editor. It has no *"I am opening/re-equipping a kitchen and need equipment
chosen and supplied"* job — and the FAQ shows they serve exactly that job
("uwzględniamy ergonomię, parametry techniczne i budżet klienta").

## Missing blocks, ranked by conversion value

1. **"Zaufali nam" — dropped in the redesign, and it existed.** The legacy
   homepage carries a client-logo wall: *"znane restauracje i hotele, jak i
   duże instytucje publiczne"* — logo files on their WordPress include
   `nbp.png` (Narodowy Bank Polski), hotels, restaurants, Grycan. This is
   verified social proof with assets in hand. Highest-value missing block,
   lowest effort.
2. **Sales/dobór path** (see above): a "Dobór i sprzedaż sprzętu" service page
   (it is a `Service` in our model — a seed entry, not a schema change), a
   `Zakup / dobór sprzętu` topic in the contact form, and a `distributor`
   flag on brands so the brand wall can say "serwis + dystrybucja".
3. **"Jak działamy" process block** (zgłoszenie → diagnoza → wycena → naprawa →
   gwarancja). Classic service-business block, absent; FAQ content already
   supports every step. Reduces first-call anxiety.
4. **Realizacje / case studies.** Both design references demand it; the client
   keeps drawing it. Content does not exist — this is a *client homework* item
   (2–3 written cases), not a build item. High conversion value for the
   procurement persona.
5. **Stats row** — still correctly blocked by FR-3 (no sources). The client can
   unblock it in one conversation: real repair count, real years, real reaction
   time. Ask, don't invent.
6. **Umowa stałej obsługi** — a B2B contract offer confirmed in the FAQ,
   invisible on the site. One section on the services page + a form topic.
   These are the stickiest, highest-LTV leads the business can get.
7. **Team/About photos** — o-firmie is text-only; the legacy site has real team
   photos (`o_firmie_zespol`, `o_firmie_maksymilian`…). Assets in hand.
8. **Coverage map** — gdzie-naprawiamy renders 16 named tiles; a visual Poland
   map with advisor routing would make the nationwide claim tangible. Nice to
   have, after 1–6.
9. **WhatsApp/SMS contact** — the legacy contact page mentions it
   (*"możliwy kontakt SMS lub WhatsApp"*); we dropped it. Verify the number
   with the client, then it is one link.

## Functional gaps already tracked (unchanged, restated for completeness)

SMTP credentials (leads persist but nobody is notified), rate limiting on the
contact action, GSC baseline before cutover (OQ-2), test database for e2e,
hero photography not yet CMS-manageable (static files — the editor cannot swap
the hero photo without a developer; contradicts the FR-4 spirit), password
rotation, per-region pages (growth thesis, deferred).

## New open questions for the client

- **OQ-10 — Sales scope.** Is equipment sales quote-driven (form + advisory)
  or does he want a product catalog? Recommendation: **no e-commerce in v1** —
  B2B equipment is quote-driven; a catalog without prices is maintenance burden
  with no conversion evidence. A "Dobór i sprzedaż" page + form topic first;
  catalog only if lead volume proves demand.
- **OQ-11 — Which brands are distributed** (vs serviced-only)? Needed to set
  the `distributor` flag truthfully. The i/lub wording proves the sets differ.
- **OQ-12 — Client-logo permissions.** The legacy site already shows them, so
  presumably cleared — confirm NBP et al. may be reused on the new site.
- **OQ-13 — Parts.** Is parts supply a standalone offer worth a section, or a
  service detail?

## Recommended next moves (cheap → expensive)

1. Seed the fourth service ("Dobór i sprzedaż sprzętu gastronomicznego") +
   contact-form topic + `distributor` flag on brands. One migration, one seed
   run, small UI additions. Unlocks the whole sales narrative.
2. Restore "Zaufali nam" with the legacy logo assets (after OQ-12).
3. Add the "Jak działamy" process block from FAQ content.
4. Send the client the five questions above (stats sources, realizacje,
   distributed brands, catalog ambition, WhatsApp number). Every one unblocks
   a block we cannot honestly build without him.
