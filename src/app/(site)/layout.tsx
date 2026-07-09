import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iziserwis.pl'),
  // AD-5: per-page titles come from CMS data, verbatim. No template that would
  // mangle the hand-written ones that already rank.
  title: { default: 'Serwis urządzeń gastronomicznych Warszawa | iziserwis.pl', template: '%s' },
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <SmoothScrollProvider>
          {/* FR-8: first focusable element on the page. */}
          <a href="#main" className="skip-link">
            Przejdź do treści
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
