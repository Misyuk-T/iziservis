'use client'

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'izi-consent'
type Decision = 'granted' | 'denied'

/**
 * AD-12: no tag fires before consent.
 *
 * GTM is the only tag surface, and its container is not injected until the
 * visitor grants consent. Nothing is loaded speculatively, no analytics id
 * appears in the page source, and declining leaves the site entirely
 * script-free. (The legacy site hard-codes `G-99MVR70KRC` via gtag, so it
 * tracks before the cookie banner has even painted.)
 *
 * The banner is a `role="dialog"` rather than a bare div: it takes focus, traps
 * nothing, and can be dismissed from the keyboard. It is rendered last in the
 * DOM so it never precedes the page's own content for a screen-reader user.
 */
export function ConsentGate({ gtmId }: { gtmId?: string }) {
  const [decision, setDecision] = useState<Decision | null | 'unknown'>('unknown')
  const acceptRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setDecision(stored === 'granted' || stored === 'denied' ? stored : null)
  }, [])

  useEffect(() => {
    if (decision === null) acceptRef.current?.focus()
  }, [decision])

  useEffect(() => {
    if (decision !== 'granted' || !gtmId) return
    if (document.getElementById('gtm-script')) return

    const script = document.createElement('script')
    script.id = 'gtm-script'
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
    document.head.appendChild(script)
    ;(window as unknown as { dataLayer?: unknown[] }).dataLayer ??= []
  }, [decision, gtmId])

  const decide = (value: Decision) => {
    localStorage.setItem(STORAGE_KEY, value)
    setDecision(value)
  }

  // 'unknown' means we have not read localStorage yet. Rendering the banner
  // during that tick would flash it at every returning visitor.
  if (decision !== null) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-green-900/10 bg-page p-4 shadow-[0_-4px_24px_rgba(2,33,20,0.08)] sm:p-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="consent-title" className="font-semibold text-green-900">
            Cookies analityczne
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Strona działa bez nich. Zgoda pozwala nam mierzyć, które treści są pomocne.{' '}
            <a href="/polityka-cookies" className="font-medium text-link-green underline underline-offset-2">
              Polityka cookies
            </a>
          </p>
        </div>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide('denied')}
            className="min-h-11 rounded-full border border-green-900/20 px-5 text-sm font-semibold text-green-900"
          >
            Odrzuć
          </button>
          <button
            ref={acceptRef}
            type="button"
            onClick={() => decide('granted')}
            className="min-h-11 rounded-full bg-action-green px-5 text-sm font-semibold text-text-on-dark"
          >
            Akceptuję
          </button>
        </div>
      </div>
    </div>
  )
}
