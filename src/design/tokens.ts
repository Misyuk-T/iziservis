/**
 * AD-7: colour tokens are contrast-tested, not eyeballed.
 *
 * The design reference's primary green (#419D45) measures 3.42:1 under white
 * text — it fails WCAG AA for normal text, and it is the primary CTA. So each
 * token declares what it may be used for, and `tests/contrast` enforces it.
 *
 * Two whites, deliberately. The reference's page background samples as #FEFEFE,
 * but text laid on a dark surface is pure #FFFFFF. They are 0.04 apart in
 * contrast ratio, which is exactly enough to move a 4.52:1 token below the
 * 4.5:1 threshold. Conflating them is how a palette passes review and fails
 * users.
 *
 * Opacity modifiers (`text-green-900/80`) are banned for text. Tailwind 4 emits
 * `oklab(... / 0.8)` for them, which axe cannot evaluate — but more importantly
 * they invent a colour no test ever checked. Every text colour is a solid token
 * below, measured here.
 *
 * `usableAs` is the contract:
 *   surface-under-white-text — a background white body text sits on (4.5:1 vs textOnDark)
 *   surface-under-dark-text  — a tinted surface dark body text sits on (4.5:1 vs the *weakest* dark text we allow, `muted`)
 *   text-on-light           — a foreground for body text on the page (4.5:1 vs pageBackground)
 *   text-on-dark            — a foreground for body text on any green surface (4.5:1 vs the lightest, green-700)
 *   nontext-only            — icons, borders, large display text (3:1)
 */

export type Usage =
  | 'surface-under-white-text'
  | 'surface-under-dark-text'
  | 'text-on-light'
  | 'text-on-dark'
  | 'nontext-only'

export type Token = {
  hex: string
  usableAs: Usage[]
  note?: string
}

/** Text laid over a dark surface. Pure white, not the page background. */
export const textOnDark = '#FFFFFF'

/** The page canvas, sampled from the design reference. */
export const pageBackground = '#FEFEFE'

/**
 * The lightest dark surface. Anything declared `text-on-dark` is measured
 * against this, because passing on green-900 says nothing about green-700.
 */
export const lightestDarkSurface = '#09311D'

export const tokens = {
  'green-900': {
    hex: '#022114',
    usableAs: ['surface-under-white-text'],
    note: 'Hero background. White on it: 17.1:1.',
  },
  'green-800': {
    hex: '#042315',
    usableAs: ['surface-under-white-text'],
    note: 'Dark cards. White on it: 16.7:1.',
  },
  'green-700': {
    hex: '#09311D',
    usableAs: ['surface-under-white-text'],
    note: 'Trust-bar band. White on it: 14.4:1.',
  },
  'brand-green': {
    hex: '#419D45',
    usableAs: ['nontext-only'],
    note: 'Straight from the reference. 3.4:1 on white — logo, large display accents, icons, borders. Never small text, never a surface under white body text.',
  },
  'action-green': {
    hex: '#37843A',
    usableAs: ['surface-under-white-text'],
    note: 'Button fill under white text. 4.64:1. Same hue and saturation as brand-green, lower lightness.',
  },
  'link-green': {
    hex: '#29632C',
    usableAs: ['text-on-light'],
    note: 'Green text on the page canvas. 7.14:1 — AAA.',
  },
  muted: {
    hex: '#495F56',
    usableAs: ['text-on-light'],
    note: 'Secondary body text on the page canvas. 6.82:1.',
  },
  'muted-on-dark': {
    hex: '#BAC5C0',
    usableAs: ['text-on-dark'],
    note: 'Secondary body text on any green surface. 8.06:1 against the lightest (green-700).',
  },
  mist: {
    hex: '#EAF1EC',
    usableAs: ['surface-under-dark-text'],
    note: 'Faint green-grey banding surface for section rhythm. 1.14:1 vs the #FEFEFE page — visible separation, not a harsh block. Dark text sits directly on it: muted 5.99:1, link-green 6.27:1, green-900 14.9:1. But brand-green is only 2.98:1 on it (under even the 3:1 non-text bar), so brand-green icons/numerals/text must stay inside bg-page cards — never directly on mist.',
  },
} as const satisfies Record<string, Token>

export type TokenName = keyof typeof tokens

// --- WCAG contrast, so the tests and the CSS agree on one implementation ---

function channel(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!)
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

/** The threshold each usage owes, per WCAG 2.2 (1.4.3 text, 1.4.11 non-text). */
export const thresholds: Record<Usage, number> = {
  'surface-under-white-text': 4.5,
  'surface-under-dark-text': 4.5,
  'text-on-light': 4.5,
  'text-on-dark': 4.5,
  'nontext-only': 3,
}

/** What each usage is measured against. */
export const reference: Record<Usage, string> = {
  'surface-under-white-text': textOnDark,
  // The weakest (lightest) dark text we permit is `muted`; a tinted surface
  // that clears 4.5:1 against it clears it for every darker text too.
  'surface-under-dark-text': tokens.muted.hex,
  'text-on-light': pageBackground,
  'text-on-dark': lightestDarkSurface,
  'nontext-only': pageBackground,
}
