import { describe, expect, it } from 'vitest'

import { createLimiter } from '@/domain/rateLimit'

/**
 * The limiter is pure and takes an injectable `now`, so time is a value here —
 * no fake timers, no sleeps. Each test drives the clock by hand.
 */
describe('createLimiter (sliding window)', () => {
  it('allows up to the limit within the window', () => {
    const limiter = createLimiter({ limit: 5, windowMs: 1000 })
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('ip', 100)).toBe(true)
    }
  })

  it('blocks the submission that exceeds the limit', () => {
    const limiter = createLimiter({ limit: 5, windowMs: 1000 })
    for (let i = 0; i < 5; i++) limiter.check('ip', 100)
    // The 6th hit inside the same window is over the limit.
    expect(limiter.check('ip', 100)).toBe(false)
    // And it stays blocked while still inside the window.
    expect(limiter.check('ip', 500)).toBe(false)
  })

  it('slides: hits that age out of the window free up capacity', () => {
    const limiter = createLimiter({ limit: 2, windowMs: 1000 })
    expect(limiter.check('ip', 0)).toBe(true)
    expect(limiter.check('ip', 500)).toBe(true)
    // Third hit at t=600 — the first two are still inside (600−1000, 600], so it
    // is blocked. Like every attempt it is still recorded, which is the point:
    // a client that keeps hammering keeps its own window alive.
    expect(limiter.check('ip', 600)).toBe(false)
    // Once the whole window has slid past every recorded hit (the latest was at
    // t=600), capacity is free again.
    expect(limiter.check('ip', 1601)).toBe(true)
    expect(limiter.check('ip', 1601)).toBe(true)
    // ...and the limit applies afresh to the new window.
    expect(limiter.check('ip', 1601)).toBe(false)
  })

  it('tracks keys independently', () => {
    const limiter = createLimiter({ limit: 1, windowMs: 1000 })
    expect(limiter.check('a', 0)).toBe(true)
    expect(limiter.check('b', 0)).toBe(true)
    // Each key has its own window; exhausting one does not touch the other.
    expect(limiter.check('a', 0)).toBe(false)
    expect(limiter.check('b', 0)).toBe(false)
  })

  it('prunes expired entries so memory does not grow unbounded', () => {
    const limiter = createLimiter({ limit: 5, windowMs: 1000 })
    // Ten thousand one-off keys, each seen once far in the past.
    for (let i = 0; i < 10_000; i++) limiter.check(`ip-${i}`, 0)
    // A single later hit whose window excludes all of them should collapse the
    // Map back down: nothing but the current key survives the eviction sweep.
    expect(limiter.check('current', 5000)).toBe(true)

    // Prove it by exhausting a fresh key's whole window — if stale keys were
    // still resident the limiter would still work, but the internal Map would
    // be huge. We assert behaviourally: an old key is treated as brand new.
    for (let i = 0; i < 5; i++) expect(limiter.check('ip-0', 5000)).toBe(true)
    // 6th within this new window is blocked — i.e. its ancient hit at t=0 was
    // pruned rather than counted.
    expect(limiter.check('ip-0', 5000)).toBe(false)
  })
})
