import { describe, expect, it } from 'vitest'

import {
  contrastRatio,
  pageBackground,
  reference,
  textOnDark,
  thresholds,
  tokens,
  type TokenName,
  type Usage,
} from '@/design/tokens'

const names = Object.keys(tokens) as TokenName[]

describe('AD-7: every token meets the contrast its declared usage owes', () => {
  it.each(names)('%s', (name) => {
    const token = tokens[name]

    for (const usage of token.usableAs) {
      const against = reference[usage]
      const ratio = contrastRatio(token.hex, against)

      expect(
        ratio,
        `${name} (${token.hex}) is declared "${usage}", which owes ${thresholds[usage]}:1 against ${against}, but measures ${ratio.toFixed(3)}:1`,
      ).toBeGreaterThanOrEqual(thresholds[usage])
    }
  })
})

describe('AD-7: the reference palette bug cannot come back', () => {
  it('brand-green may not carry text, in either direction', () => {
    // #419D45 measures 3.4:1 against white. It is the design reference's
    // primary CTA fill; shipping it rebuilds the legacy site's contrast defect.
    expect(tokens['brand-green'].usableAs).toEqual(['nontext-only'])
    expect(contrastRatio(tokens['brand-green'].hex, textOnDark)).toBeLessThan(4.5)
  })

  it('action-green is the fill that replaces it, and clears AA under white text', () => {
    expect(contrastRatio(tokens['action-green'].hex, textOnDark)).toBeGreaterThanOrEqual(4.5)
  })

  it('link-green clears AAA for green text on the page canvas', () => {
    expect(contrastRatio(tokens['link-green'].hex, pageBackground)).toBeGreaterThanOrEqual(7)
  })

  it('brand-green may not sit directly on mist either', () => {
    // #419D45 on mist (#EAF1EC) measures 2.98:1 — under even the 3:1 non-text
    // bar, and nowhere near the 4.5:1 text bar. So brand-green icons, numerals
    // and text must never sit directly on a mist band; they belong inside a
    // bg-page card. The homepage honours this: on every mist band the
    // brand-green accents (trust-card icons, equipment/carousel cards) live
    // only in bg-page cards, and the "Jak działamy" step numerals — which sit
    // on bg-mist cards — use link-green (6.27:1 on mist), not brand-green.
    expect(contrastRatio(tokens['brand-green'].hex, tokens.mist.hex)).toBeLessThan(3)
  })
})

describe('the two whites are not interchangeable', () => {
  it('action-green passes against text white but would fail against a page-white of #FEFEFE at 4.52:1', () => {
    // Guards the bug this file was written to catch: measuring a button fill
    // against the page background instead of the text laid on it.
    expect(pageBackground).not.toBe(textOnDark)
    expect(contrastRatio(tokens['action-green'].hex, textOnDark)).toBeGreaterThan(
      contrastRatio(tokens['action-green'].hex, pageBackground),
    )
  })

  const surfaces = names.filter((n) =>
    (tokens[n].usableAs as readonly Usage[]).includes('surface-under-white-text'),
  )

  it.each(surfaces)('white text on %s clears 4.5:1', (name) => {
    expect(contrastRatio(textOnDark, tokens[name].hex)).toBeGreaterThanOrEqual(4.5)
  })
})
