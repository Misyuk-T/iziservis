import { expect, test } from '@playwright/test'

import { ROUTES } from './routes'

/**
 * Layout regressions that a screenshot review would catch on one page and miss
 * on the other twenty-one. Runs at every breakpoint the config declares.
 */

test.describe('no page scrolls sideways', () => {
  for (const route of ROUTES) {
    test(`${route}`, async ({ page }) => {
      await page.goto(route)

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        if (doc.scrollWidth <= doc.clientWidth) return null

        // Name the culprit rather than just failing — an overflow of 3px on an
        // unknown element is a bug report nobody can act on.
        const guilty = [...document.querySelectorAll<HTMLElement>('body *')]
          .filter((el) => {
            const r = el.getBoundingClientRect()
            return r.right > doc.clientWidth + 1 || r.left < -1
          })
          .slice(0, 3)
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`)

        return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, guilty }
      })

      expect(overflow, `horizontal overflow: ${JSON.stringify(overflow)}`).toBeNull()
    })
  }
})

/**
 * WCAG 2.2 §2.5.8 Target Size (Minimum) is **24x24** at Level AA. The 44x44
 * figure everyone quotes is §2.5.5, Level AAA. Holding every link in the site
 * to 44px would fail the header nav for no accessibility gain, so the gate is
 * the real AA bar — and the controls that genuinely matter on a phone are held
 * to 44 separately below.
 */
test('every interactive control clears the AA 24x24 target', async ({ page }) => {
  const offenders: string[] = []

  for (const route of ROUTES) {
    await page.goto(route)

    const small = await page.evaluate(() => {
      // Inline links inside a sentence are explicitly exempt from 2.5.8.
      const isInlineInProse = (el: Element) =>
        el.tagName === 'A' && el.closest('p, address, dd, label, summary') !== null

      return [...document.querySelectorAll<HTMLElement>('a, button, select, input[type="checkbox"]')]
        .filter((el) => {
          if (isInlineInProse(el)) return false
          const r = el.getBoundingClientRect()
          if (r.width === 0 && r.height === 0) return false // hidden
          return r.height < 24 || r.width < 24
        })
        .map((el) => {
          const r = el.getBoundingClientRect()
          return `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`
        })
    })

    offenders.push(...small.map((s) => `${route} → ${s}`))
  }

  expect(offenders, `undersized controls:\n${offenders.join('\n')}`).toEqual([])
})

/** FR-15 and the submit button: the two controls a panicking visitor reaches for. */
test('primary calls to action clear 44x44', async ({ page }) => {
  await page.goto('/')

  for (const locator of [
    page.locator('header a[href^="tel:"]').first(),
    page.locator('main a[href^="tel:"]').first(),
  ]) {
    const box = await locator.boundingBox()
    expect(box!.height, 'primary CTA is under 44px tall').toBeGreaterThanOrEqual(44)
  }

  await page.goto('/kontakt')
  const submit = page.getByRole('button', { name: /Wyślij zgłoszenie/i })
  const box = await submit.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)
})

test('the phone number sits inside the first mobile viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'FR-15 is a mobile guarantee')

  await page.goto('/')
  const phone = page.locator('header a[href^="tel:"]').first()
  await expect(phone).toBeVisible()

  const box = await phone.boundingBox()
  const viewport = page.viewportSize()!
  expect(box!.y + box!.height, 'phone link is below the fold').toBeLessThan(viewport.height)
})

test('mobile navigation exists and traps nothing', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the burger only exists below lg')

  await page.goto('/')
  const trigger = page.getByRole('button', { name: /menu/i })
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('navigation', { name: /mobilna/i })).toBeVisible()

  // Escape must close it and hand focus back, or the keyboard user is stranded.
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
})
