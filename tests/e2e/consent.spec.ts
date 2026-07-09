import { expect, test } from '@playwright/test'

/**
 * AD-12: no tag fires before consent.
 *
 * The strongest version of this is a network assertion, not a DOM one: nothing
 * may be *requested* from a tag domain until the visitor says yes. A test that
 * only checks for a missing <script> would pass while a beacon fired from a
 * bundled snippet.
 */

test.use({ contextOptions: { reducedMotion: 'reduce' } })

const TAG_HOSTS = /googletagmanager\.com|google-analytics\.com|doubleclick\.net|facebook\.net/

test('nothing is requested from a tag domain before consent', async ({ page }) => {
  const tagRequests: string[] = []
  page.on('request', (req) => {
    if (TAG_HOSTS.test(req.url())) tagRequests.push(req.url())
  })

  await page.goto('/')
  await page.waitForTimeout(1000)

  expect(tagRequests, `tag requests fired before consent:\n${tagRequests.join('\n')}`).toEqual([])
})

test('no analytics identifier appears in the page source', async ({ page }) => {
  const response = await page.goto('/')
  const html = (await response!.text()).toLowerCase()

  // The legacy site hard-codes this one.
  expect(html).not.toContain('g-99mvr70krc')
  expect(html).not.toContain('googletagmanager')
})

test('the banner appears once, is keyboard-operable, and remembers the answer', async ({ page }) => {
  await page.goto('/')

  const banner = page.getByRole('dialog', { name: /Cookies/i })
  await expect(banner).toBeVisible()

  // It takes focus, so a keyboard user is not left hunting for it.
  await expect(page.getByRole('button', { name: 'Akceptuję' })).toBeFocused()

  await page.getByRole('button', { name: 'Odrzuć' }).click()
  await expect(banner).toBeHidden()

  // A returning visitor is not asked again.
  await page.reload()
  await expect(page.getByRole('dialog', { name: /Cookies/i })).toBeHidden()
})

test('declining leaves the site with no tag requests at all', async ({ page }) => {
  const tagRequests: string[] = []
  page.on('request', (req) => {
    if (TAG_HOSTS.test(req.url())) tagRequests.push(req.url())
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Odrzuć' }).click()
  await page.goto('/kontakt')
  await page.waitForTimeout(800)

  expect(tagRequests).toEqual([])
})
