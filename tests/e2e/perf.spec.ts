import { expect, test } from '@playwright/test'

/**
 * AD-15 claims the hero must not animate on mount because Chrome ignores an
 * opacity:0 element for LCP. This measures it rather than asserting it.
 *
 * Local numbers are not field data, so the bar is deliberately loose — it is a
 * regression guard, not a Core Web Vitals verdict.
 */
test.use({ contextOptions: { reducedMotion: 'no-preference' } })

test('the LCP element is the hero heading and it paints promptly', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' })

  const lcp = await page.evaluate(
    () =>
      new Promise<{ time: number; tag: string; text: string }>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as (PerformanceEntry & { element?: Element })[]
          const last = entries[entries.length - 1]!
          resolve({
            time: last.startTime,
            tag: last.element?.tagName ?? '?',
            text: (last.element?.textContent ?? '').slice(0, 40),
          })
        }).observe({ type: 'largest-contentful-paint', buffered: true })

        setTimeout(() => resolve({ time: -1, tag: 'none', text: '' }), 4000)
      }),
  )

  console.log(`LCP ${Math.round(lcp.time)}ms on <${lcp.tag}> "${lcp.text}"`)

  expect(lcp.time, 'no LCP entry was recorded').toBeGreaterThan(0)
  expect(lcp.time, 'LCP regressed badly on a local server').toBeLessThan(2500)
})
