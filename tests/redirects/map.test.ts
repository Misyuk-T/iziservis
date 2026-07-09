import { describe, expect, it } from 'vitest'

import { legacyPaths, redirects, resolveRedirect } from '@/domain/redirects'

/**
 * This file checks the *shape of the map*. It does not prove what the server
 * does — it passed happily while every slashed legacy URL took two hops over
 * HTTP, because Next's trailing-slash normalisation fired before our redirects.
 * `tests/e2e/redirects.spec.ts` is the one that tests reality.
 */
describe('AD-6: the redirect map preserves every indexed URL', () => {
  it('records all 22 legacy paths', () => {
    expect(legacyPaths).toHaveLength(22)
    expect(new Set(legacyPaths).size).toBe(22)
  })

  it.each(legacyPaths)('%s resolves in at most one hop', (path) => {
    const { hops } = resolveRedirect(path)
    expect(hops, `${path} redirects more than once — chains lose PageRank and break AD-6`).toBeLessThanOrEqual(1)
  })

  it('no redirect target is itself a redirect source', () => {
    const sources = new Set(redirects.map((r) => r.from))
    const chained = redirects.filter((r) => sources.has(r.to))
    expect(chained, `chained redirects: ${chained.map((r) => `${r.from} -> ${r.to}`).join(', ')}`).toEqual([])
  })

  it('no redirect points at itself', () => {
    expect(redirects.filter((r) => r.from === r.to)).toEqual([])
  })

  it('every source is unique', () => {
    const sources = redirects.map((r) => r.from)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('corrects the two legacy slugs that are simply wrong', () => {
    expect(resolveRedirect('/uslugi/serwis-conovtherm').target).toBe('/uslugi/serwis-convotherm')
    expect(resolveRedirect('/uslugi/jakie-uslugi-swiadczymy/instalacji-i-deinstalacje').target).toBe(
      '/uslugi/jakie-uslugi-swiadczymy/instalacje-i-deinstalacje',
    )
  })

  it('FR-13: every equipment page lands under /urzadzenia', () => {
    const equipment = legacyPaths.filter((p) => p.startsWith('/uslugi/co-naprawiamy'))
    expect(equipment).toHaveLength(6) // index + five categories

    for (const path of equipment) {
      expect(resolveRedirect(path).target).toMatch(/^\/urzadzenia/)
    }
  })

  it('every redirect explains why it exists', () => {
    for (const r of redirects) expect(r.reason.length).toBeGreaterThan(20)
  })
})
