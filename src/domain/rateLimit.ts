/**
 * A pure, in-memory sliding-window rate limiter. No dependencies, no I/O — it is
 * a Map of key → recent-hit timestamps, so it is trivially unit-testable with an
 * injectable clock.
 *
 * Honest about its reach: this counts hits *within a single process*. On
 * multi-instance serverless each instance keeps its own window, so a caller
 * spread across N instances gets up to N× the limit before any one instance
 * trips. That degrades the guarantee; it does not remove it (a bot hammering one
 * warm instance is still capped). A durable, shared store — Postgres or a KV —
 * is the production-grade follow-up. This module deliberately does not pretend to
 * be that.
 */

export type Limiter = {
  /**
   * Records a hit for `key` at `now` and returns whether it is allowed — true
   * while the number of hits inside the trailing window is at or below `limit`,
   * false once it exceeds it. Every call counts, allowed or not.
   */
  check: (key: string, now?: number) => boolean
}

export function createLimiter({ limit, windowMs }: { limit: number; windowMs: number }): Limiter {
  // key → ascending list of hit timestamps still inside the window.
  const hits = new Map<string, number[]>()

  return {
    check(key, now = Date.now()) {
      const cutoff = now - windowMs

      // Prune this key, then drop it entirely if nothing survives — otherwise the
      // Map would retain an entry for every key ever seen and grow without bound.
      const kept = (hits.get(key) ?? []).filter((t) => t > cutoff)
      kept.push(now)
      hits.set(key, kept)

      // Opportunistically evict other keys whose windows have fully expired, so a
      // burst of one-off keys (e.g. spoofed IPs) cannot leak memory over time.
      for (const [k, ts] of hits) {
        if (k === key) continue
        if (ts.length === 0 || ts[ts.length - 1]! <= cutoff) hits.delete(k)
      }

      return kept.length <= limit
    },
  }
}
