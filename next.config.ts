import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { redirects } from './src/domain/redirects'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      { pathname: '/api/media/file/**' },
      // /hero/** is the client's own photography, shipped statically in /public.
      { pathname: '/hero/**' },
    ],
  },

  /**
   * AD-6, and the reason this is not the default.
   *
   * Every legacy WordPress URL ended in a slash. With Next's built-in trailing
   * slash handling, `/uslugi/co-naprawiamy/` took *two* hops: a 308 to strip
   * the slash, then our 301 to `/urzadzenia`. Two hops on exactly the 22 URLs
   * AD-6 exists to protect.
   *
   * So we skip Next's normalization and own it: each redirect is emitted for
   * both the bare and slashed source, and a final catch-all strips the slash
   * from everything else. One hop, always.
   */
  skipTrailingSlashRedirect: true,

  redirects: async () => [
    ...redirects.flatMap(({ from, to }) => [
      { source: from, destination: to, statusCode: 301 as const },
      { source: `${from}/`, destination: to, statusCode: 301 as const },
    ]),
    // Everything else: strip the trailing slash in a single 301.
    { source: '/:path+/', destination: '/:path+', statusCode: 301 as const },
  ],

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },

  turbopack: { root: path.resolve(dirname) },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
