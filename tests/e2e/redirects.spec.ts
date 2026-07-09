import { expect, test } from '@playwright/test'

import { legacyPaths } from '../../src/domain/redirects'

/**
 * AD-6, tested over HTTP rather than over the in-memory map.
 *
 * `tests/redirects/map.test.ts` asserts the map has no chains, and it passed
 * happily while the real server took two hops for every slashed legacy URL:
 * Next's own trailing-slash normalization fired a 308 first, and only then did
 * our 301 run. A unit test of a data structure cannot see that. This can.
 *
 * Every legacy WordPress URL ended in a slash, so the slashed form is the one
 * that matters — it is what Google has indexed and what old links point at.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'routing does not vary by viewport')
})

async function walk(request: import('@playwright/test').APIRequestContext, path: string) {
  const chain: number[] = []
  let url = path

  for (let i = 0; i < 5; i++) {
    const response = await request.get(url, { maxRedirects: 0 })
    const status = response.status()
    if (status < 300 || status >= 400) return { status, hops: chain.length, chain }

    chain.push(status)
    const location = response.headers()['location']!
    url = location.startsWith('http') ? new URL(location).pathname : location
  }

  return { status: 0, hops: chain.length, chain }
}

test.describe('every legacy URL survives, in one hop', () => {
  for (const path of legacyPaths) {
    const slashed = path === '/' ? '/' : `${path}/`

    test(`${slashed}`, async ({ request }) => {
      const { status, hops, chain } = await walk(request, slashed)

      expect(status, `${slashed} did not end at 200 (chain: ${chain.join(' → ')})`).toBe(200)
      expect(hops, `${slashed} took ${hops} hops: ${chain.join(' → ')}`).toBeLessThanOrEqual(1)
    })

    test(`${path} (unslashed)`, async ({ request }) => {
      const { status, hops, chain } = await walk(request, path)

      expect(status, `${path} did not end at 200`).toBe(200)
      expect(hops, `${path} took ${hops} hops: ${chain.join(' → ')}`).toBeLessThanOrEqual(1)
    })
  }
})

test('redirects are 301, the status search engines treat as a permanent move', async ({
  request,
}) => {
  const response = await request.get('/uslugi/serwis-conovtherm/', { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  expect(response.headers()['location']).toContain('/uslugi/serwis-convotherm')
})

test('the public REST surface cannot create a lead', async ({ request }) => {
  // `create: () => true` on the collection opened POST /api/leads to anyone,
  // bypassing the honeypot and the schema in the server action. A bot got in.
  const response = await request.post('/api/leads', {
    data: {
      name: 'Bot',
      email: 'bot@spam.example',
      company: 'X',
      phone: '123456789',
      voivodeship: 1,
      topic: 'Serwis',
      message: 'aaaaaaaaaaaa',
      consent: true,
    },
  })

  expect(response.status(), 'POST /api/leads must not create a lead').toBeGreaterThanOrEqual(400)
})
