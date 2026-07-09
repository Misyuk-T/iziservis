import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { pageBackground, textOnDark, tokens, type TokenName } from '@/design/tokens'

const css = readFileSync(path.resolve(process.cwd(), 'src/design/tokens.css'), 'utf8')

function cssVar(name: string): string | undefined {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6})`))
  return match?.[1]?.toUpperCase()
}

/**
 * AD-7 says no component may carry a hex literal, which only holds if the CSS
 * and the TS agree. Nothing generates one from the other, so this guards drift.
 */
describe('tokens.css matches tokens.ts', () => {
  const names = Object.keys(tokens) as TokenName[]

  it.each(names)('--color-%s', (name) => {
    expect(cssVar(name), `--color-${name} is missing from tokens.css`).toBe(
      tokens[name].hex.toUpperCase(),
    )
  })

  it('exposes both whites separately', () => {
    expect(cssVar('text-on-dark')).toBe(textOnDark.toUpperCase())
    expect(cssVar('page')).toBe(pageBackground.toUpperCase())
  })

  it('declares no colour the TS module does not know about', () => {
    const declared = [...css.matchAll(/--color-([a-z0-9-]+):/g)].map((m) => m[1]!)
    const known = new Set<string>([...names, 'text-on-dark', 'page'])
    expect(declared.filter((d) => !known.has(d))).toEqual([])
  })
})
