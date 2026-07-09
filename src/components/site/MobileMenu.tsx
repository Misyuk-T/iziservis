'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

/**
 * Without this the site has no navigation below the `lg` breakpoint — which is
 * most of its traffic, since the primary user is on a phone next to a broken
 * oven.
 *
 * Accessibility contract:
 * - the trigger is a real button carrying aria-expanded and aria-controls
 * - Escape closes and returns focus to the trigger (WCAG 2.1.2, no keyboard trap)
 * - opening moves focus into the panel; Tab cycles inside it while open
 * - the page behind cannot scroll while the panel is open
 * - the panel is `hidden` when closed, so its links leave the tab order entirely
 */
export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // A route change with the panel still open would strand focus in a closed menu.
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a, button')
      if (!focusable?.length) return

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex size-11 items-center justify-center rounded-full border border-green-900/15 lg:hidden"
      >
        <span className="sr-only">{open ? 'Zamknij menu' : 'Otwórz menu'}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 stroke-green-900" fill="none" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <>
              <path d="M5 5l14 14" />
              <path d="M19 5L5 19" />
            </>
          ) : (
            <>
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </>
          )}
        </svg>
      </button>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 overflow-y-auto border-t border-green-900/10 bg-page px-4 pb-10 pt-4 lg:hidden"
      >
        <nav aria-label="Główna (mobilna)">
          <ul className="divide-y divide-green-900/10">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-14 items-center text-lg font-medium text-green-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/kontakt"
          className="mt-8 flex min-h-12 items-center justify-center rounded-full bg-action-green px-6 font-semibold text-text-on-dark"
        >
          Wyceń naprawę
        </Link>
      </div>
    </>
  )
}
