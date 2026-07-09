import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/**
 * One place decides horizontal rhythm and max width. Every page uses it, so a
 * padding change is one edit rather than twenty, and no two sections can
 * disagree about where the page edge is.
 *
 * Mobile 16px → tablet 24px → desktop 32px, with the container capped at 80rem.
 */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}

export function Section({
  children,
  className = '',
  dark = false,
  id,
}: {
  children: ReactNode
  className?: string
  dark?: boolean
  id?: string
}) {
  return (
    <section
      id={id}
      className={`${dark ? 'on-dark bg-green-900 text-text-on-dark' : ''} py-16 sm:py-20 lg:py-24 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  )
}

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string
  title: string
  lead?: string
}) {
  return (
    <header className="on-dark bg-green-900 py-16 text-text-on-dark sm:py-20 lg:py-24">
      <Container>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-green">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-4xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {lead ? (
          <p className="mt-5 max-w-2xl text-pretty text-base text-text-on-dark/80 sm:text-lg">{lead}</p>
        ) : null}
      </Container>
    </header>
  )
}

type ButtonProps = { children: ReactNode; className?: string }

/** WCAG 2.5.8: every control clears a 44x44 target. `min-h-12` is 48px. */
const base =
  'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-transform duration-200 motion-safe:hover:scale-[1.02] sm:text-base'

export function ButtonLink({
  children,
  className = '',
  ...props
}: ButtonProps & ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={`${base} bg-action-green text-text-on-dark ${className}`}>
      {children}
    </Link>
  )
}

export function ButtonAnchor({
  children,
  className = '',
  ...props
}: ButtonProps & ComponentProps<'a'>) {
  return (
    <a {...props} className={`${base} bg-action-green text-text-on-dark ${className}`}>
      {children}
    </a>
  )
}

export function GhostLink({ children, className = '', ...props }: ButtonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`${base} border border-current/30 transition-colors motion-safe:hover:scale-100 hover:bg-current/10 ${className}`}
    >
      {children}
    </Link>
  )
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl space-y-4 text-base leading-relaxed text-green-900/80 sm:text-lg">
      {children}
    </div>
  )
}
