import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Both motion paths. Everything else in the suite runs under reduced motion.
 *
 * Measured on *computed* opacity, not `el.style.opacity`: the CSS override in
 * globals.css beats motion's inline style, so reading the inline value would
 * report the animation's intent rather than what the visitor actually sees.
 */

const fadedRevealCount = () =>
  [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
    (el) => Number(getComputedStyle(el).opacity) < 0.99,
  ).length

test.describe('with motion enabled', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  test('every revealed element ends fully opaque', async ({ page }) => {
    await page.goto('/')

    // Walk the page the way a visitor does, so each observer gets its chance.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, document.body.scrollHeight)
    })
    await page.waitForTimeout(1200)

    expect(
      await page.evaluate(fadedRevealCount),
      'elements remain faded after animations settled',
    ).toBe(0)
  })

  test('contrast holds once animations have settled', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1500)

    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze()
    expect(violations.length, `\n${violations.map((v) => `${v.id} — ${v.help}`).join('\n')}\n`).toBe(0)
  })
})

test.describe('with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  /**
   * Guards a real bug this caught: `useReducedMotion()` returns null on the
   * first client render, so branching on it in JS let motion write an inline
   * `opacity: 0` before the flag resolved — and once `whileInView` was dropped,
   * nothing animated it back. Reduced-motion visitors got a blank page.
   */
  test('content is painted immediately, without scrolling', async ({ page }) => {
    await page.goto('/')

    expect(
      await page.evaluate(fadedRevealCount),
      'reduced-motion visitors must not wait for a scroll reveal',
    ).toBe(0)
  })

  test('the last reveal on the page is visible before any observer fires', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-reveal]').last()).toHaveCSS('opacity', '1')
  })
})
