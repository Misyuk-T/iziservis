'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Scroll-triggered reveal.
 *
 * Reduced motion is enforced in CSS, not here. `useReducedMotion()` returns
 * null on the first client render, so branching on it means motion writes an
 * inline `opacity: 0` before the flag resolves — and once `whileInView` is
 * dropped on the next render, nothing ever animates it back. The element stays
 * invisible forever, and the visitor who asked for less motion gets a blank
 * page instead.
 *
 * So: these elements always animate, and `globals.css` overrides them with
 * `[data-reveal] { opacity: 1 !important }` under
 * `prefers-reduced-motion: reduce`. A stylesheet rule beats an inline style,
 * applies before first paint, and cannot lose a hydration race.
 *
 * `once` means an element never re-animates when scrolled past twice — repeated
 * motion on a page someone is trying to read is what WCAG 2.2.2 exists to stop.
 */

const EASE = [0.22, 1, 0.36, 1] as const
const VIEWPORT = { once: true, margin: '-80px' } as const

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Staggers its children's reveals. Same reduced-motion contract. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}
