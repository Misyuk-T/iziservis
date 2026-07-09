/**
 * AD-6: the redirect map is a tested artifact.
 *
 * Every path here is already indexed by Google. A rename without a 301 is a
 * lost ranking, so the map is data, defined once, and `tests/redirects` asserts
 * that all 22 legacy paths resolve in a single hop.
 */

export type Redirect = {
  from: string
  to: string
  /** Why this path moved. Kept because "why is this here" outlives everyone. */
  reason: string
}

export const redirects: Redirect[] = [
  {
    from: '/uslugi/serwis-conovtherm',
    to: '/uslugi/serwis-convotherm',
    reason: 'Legacy slug misspells the brand: Convotherm, not Conovtherm.',
  },
  {
    from: '/uslugi/jakie-uslugi-swiadczymy/instalacji-i-deinstalacje',
    to: '/uslugi/jakie-uslugi-swiadczymy/instalacje-i-deinstalacje',
    reason: 'Legacy slug is ungrammatical Polish (genitive instead of nominative).',
  },

  // FR-13 / OQ-6: the five equipment pages move to top level so they sit one
  // click from the homepage. They are the site's most valuable URLs, so each
  // old path redirects rather than 404s.
  {
    from: '/uslugi/co-naprawiamy/piece-konwekcyjno-parowe',
    to: '/urzadzenia/piece-konwekcyjno-parowe',
    reason: 'FR-13: promoted to top level to reach click depth 1.',
  },
  {
    from: '/uslugi/co-naprawiamy/urzadzenia-grzewcze',
    to: '/urzadzenia/urzadzenia-grzewcze',
    reason: 'FR-13: promoted to top level to reach click depth 1.',
  },
  {
    from: '/uslugi/co-naprawiamy/ekspresy-i-urzadzenia-barowe',
    to: '/urzadzenia/ekspresy-i-urzadzenia-barowe',
    reason: 'FR-13: promoted to top level to reach click depth 1.',
  },
  {
    from: '/uslugi/co-naprawiamy/zmywarki-gastronomiczne',
    to: '/urzadzenia/zmywarki-gastronomiczne',
    reason: 'FR-13: promoted to top level to reach click depth 1.',
  },
  {
    from: '/uslugi/co-naprawiamy/urzadzenia-chlodnicze',
    to: '/urzadzenia/urzadzenia-chlodnicze',
    reason: 'FR-13: promoted to top level to reach click depth 1.',
  },
  {
    from: '/uslugi/co-naprawiamy',
    to: '/urzadzenia',
    reason: 'FR-13: the equipment index moves with its children.',
  },
]

/** The 22 URLs recorded in the legacy sitemap. `tests/redirects` walks all of them. */
export const legacyPaths: string[] = [
  '/',
  '/o-firmie',
  '/uslugi',
  '/uslugi/co-naprawiamy',
  '/uslugi/co-naprawiamy/piece-konwekcyjno-parowe',
  '/uslugi/co-naprawiamy/urzadzenia-grzewcze',
  '/uslugi/co-naprawiamy/ekspresy-i-urzadzenia-barowe',
  '/uslugi/co-naprawiamy/zmywarki-gastronomiczne',
  '/uslugi/co-naprawiamy/urzadzenia-chlodnicze',
  '/uslugi/jakie-uslugi-swiadczymy',
  '/uslugi/jakie-uslugi-swiadczymy/przeglady-okresowe',
  '/uslugi/jakie-uslugi-swiadczymy/naprawy-awaryjne',
  '/uslugi/jakie-uslugi-swiadczymy/instalacji-i-deinstalacje',
  '/uslugi/jakie-uslugi-swiadczymy/marki-naprawianego-sprzetu',
  '/uslugi/gdzie-naprawiamy',
  '/uslugi/serwis-unic',
  '/uslugi/serwis-stalgast',
  '/uslugi/serwis-firex',
  '/uslugi/serwis-conovtherm',
  '/centrum-wiedzy',
  '/kontakt',
  '/polityka-cookies',
]

const bySource = new Map(redirects.map((r) => [r.from, r.to]))

/** Resolves a path through the map, following at most `maxHops` redirects. */
export function resolveRedirect(path: string, maxHops = 4): { target: string; hops: number } {
  let target = path
  let hops = 0
  while (bySource.has(target) && hops < maxHops) {
    target = bySource.get(target)!
    hops += 1
  }
  return { target, hops }
}
