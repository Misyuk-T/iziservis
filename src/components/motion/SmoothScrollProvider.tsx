'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * Smooth scrolling, with a hard exit.
 *
 * Scroll hijacking is an accessibility liability: it desynchronises the visual
 * position from the browser's own, which breaks scroll-anchoring, find-in-page,
 * and anyone who has asked their OS to reduce motion. So Lenis is not merely
 * slowed down under `prefers-reduced-motion` — it is never constructed, and the
 * browser's native scrolling is left completely alone.
 *
 * We also listen for changes to the media query rather than reading it once, so
 * a visitor who flips the OS setting mid-session gets the change immediately.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | null = null
    let frame = 0

    const start = () => {
      if (lenis) return
      lenis = new Lenis({ duration: 1.05, smoothWheel: true })

      const raf = (time: number) => {
        lenis?.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      lenis?.destroy()
      lenis = null
    }

    const sync = () => (query.matches ? stop() : start())

    sync()
    query.addEventListener('change', sync)

    return () => {
      query.removeEventListener('change', sync)
      stop()
    }
  }, [])

  return children
}
