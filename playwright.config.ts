import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 3100)

export default defineConfig({
  testDir: './tests/e2e',
  // Removes the `leads` rows the contact tests create, so the suite no longer
  // depends on someone deleting them by hand. Not collected as a test — it does
  // not match the `*.spec.ts` pattern.
  globalTeardown: './tests/e2e/global-teardown.ts',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',

    // Scroll-reveal animations start at opacity:0, so an axe scan that races
    // them measures contrast against a half-faded element and reports garbage.
    // Reduced motion is not a workaround here — it is the contract: a visitor
    // who asks for it must get the whole page, painted, immediately. The
    // motion-on path is covered separately in reveal.spec.ts.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 834, height: 1112 } } },
    // A Chromium mobile device on purpose: `iPhone 14` defaults to WebKit, which
    // means installing a second browser to learn nothing new about layout or
    // axe. Real Safari belongs in a manual pass, not the build gate.
    { name: 'mobile', use: { ...devices['Galaxy S24'] } },
  ],
  webServer: {
    command: 'pnpm start',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { PORT: String(PORT) },
  },
})
