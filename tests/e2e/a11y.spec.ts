import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { ROUTES } from './routes'

/**
 * AD-11: accessibility is a build gate.
 *
 * Every route, every breakpoint, WCAG 2.2 A and AA. Any violation fails. There
 * is no suppression file — the legacy site reached 244 alt-less images exactly
 * because a11y was an audit item rather than a gate.
 */
for (const route of ROUTES) {
  test(`a11y: ${route}`, async ({ page }) => {
    await page.goto(route)

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const summary = violations.map(
      (v) => `${v.id} (${v.impact}) — ${v.help}\n    ${v.nodes.map((n) => n.target.join(' ')).join('\n    ')}`,
    )

    expect(violations.length, `\n${summary.join('\n')}\n`).toBe(0)
  })
}

test('every page has exactly one h1', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route)
    const count = await page.locator('h1').count()
    expect(count, `${route} has ${count} <h1> elements`).toBe(1)
  }
})

test('no image ships without alt', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route)
    const missing = await page.locator('img:not([alt])').count()
    expect(missing, `${route} has ${missing} images without an alt attribute`).toBe(0)
  }
})
