import { expect, test } from '@playwright/test'

import { ROUTES } from './routes'

/**
 * The crawler-facing surface. `robots.ts` silently emitted nothing for a while
 * because it sat inside a route group — the site built, every page rendered,
 * and AD-10's claim that `/admin` is disallowed was simply false. Nothing but a
 * request would have caught it.
 */

test.use({ contextOptions: { reducedMotion: 'reduce' } })

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'crawler surface does not vary by viewport')
})

test('robots.txt exists and disallows the CMS', async ({ request }) => {
  const response = await request.get('/robots.txt')
  expect(response.status()).toBe(200)

  const body = await response.text()
  expect(body).toContain('Disallow: /admin')
  expect(body).toContain('Disallow: /api')
  expect(body).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/)
})

test('sitemap.xml lists every public route and no private one', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)

  const xml = await response.text()
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname)

  for (const route of ROUTES) {
    expect(paths, `${route} is missing from the sitemap`).toContain(route === '/' ? '/' : route)
  }

  // AD-10: the CMS is excluded from the sitemap, not merely from robots.txt.
  expect(paths.some((p) => p.startsWith('/admin') || p.startsWith('/api'))).toBe(false)
})

test('every page carries exactly one canonical, pointing at itself', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route)

    const canonicals = page.locator('link[rel="canonical"]')
    expect(await canonicals.count(), `${route} has the wrong number of canonicals`).toBe(1)

    const href = await canonicals.first().getAttribute('href')
    expect(new URL(href!).pathname, `${route} canonical points elsewhere`).toBe(route)
  }
})

test('titles and descriptions are present and unique across the site', async ({ page }) => {
  const titles = new Map<string, string>()
  const descriptions = new Map<string, string>()

  for (const route of ROUTES) {
    await page.goto(route)

    const title = await page.title()
    const description = await page.locator('meta[name="description"]').getAttribute('content')

    expect(title.length, `${route} has no title`).toBeGreaterThan(10)
    expect(description?.length ?? 0, `${route} has no meta description`).toBeGreaterThan(10)

    const titleClash = titles.get(title)
    expect(titleClash, `${route} duplicates the title of ${titleClash}`).toBeUndefined()
    titles.set(title, route)

    const descClash = descriptions.get(description!)
    expect(descClash, `${route} duplicates the description of ${descClash}`).toBeUndefined()
    descriptions.set(description!, route)
  }
})

test('no page emits the Article or Person schema the legacy site got wrong', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route)

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    for (const block of blocks) {
      expect(block, `${route} emits Article schema`).not.toContain('"Article"')
      expect(block, `${route} emits Person schema`).not.toContain('"Person"')
    }
  }
})

test('the homepage declares one LocalBusiness with real opening hours', async ({ page }) => {
  await page.goto('/')

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  const business = blocks.map((b) => JSON.parse(b)).find((s) => s['@type'] === 'LocalBusiness')

  expect(business, 'no LocalBusiness node on the homepage').toBeDefined()
  expect(business.telephone).toBe('+48786631714')

  // The design reference claims 24/7. The contact page says Mon-Fri 08:00-17:00.
  const [hours] = business.openingHoursSpecification
  expect(hours.opens).toBe('08:00')
  expect(hours.closes).toBe('17:00')
  expect(hours.dayOfWeek).not.toContain('Sunday')
})
