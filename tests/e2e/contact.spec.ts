import { expect, test } from '@playwright/test'

/**
 * The contact form is the site's only revenue event, so it gets a real
 * end-to-end pass rather than a unit test of its validation.
 *
 * No email adapter is configured in this environment, so Payload writes the
 * notification to the console — which is precisely the failure mode AD-8 exists
 * for. A lead must be persisted and the visitor must see success even when the
 * notification never leaves the building.
 */

test.use({ contextOptions: { reducedMotion: 'reduce' } })

/**
 * These tests write real rows to whatever database `.env` points at, which is
 * currently the production Supabase project. Running them once per breakpoint
 * would triple that pollution for no extra signal — the form's behaviour does
 * not vary by viewport. Until there is a dedicated test database, they run on
 * desktop only, and the rows they create are cleaned up by hand.
 */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'writes to the live database; one run is enough')
})

const fill = async (page: import('@playwright/test').Page) => {
  await page.getByLabel('Imię i nazwisko').fill('Marek Kowalski')
  await page.getByLabel('E-mail', { exact: false }).first().fill('marek@bistro.example')
  await page.getByLabel('Nazwa firmy / lokal').fill('Bistro Praga')
  await page.getByLabel('Numer telefonu').fill('+48 601 234 567')
  await page.getByLabel('Województwo').selectOption({ label: 'Mazowieckie' })
  await page.getByLabel('Temat').selectOption('Serwis')
  await page.getByLabel('Treść wiadomości / opis problemu').fill('Piec Convotherm zgłasza błąd E14.')
}

test('a valid submission is accepted and confirmed', async ({ page }) => {
  await page.goto('/kontakt')
  await fill(page)
  await page.getByRole('checkbox').check()

  await page.getByRole('button', { name: /Wyślij zgłoszenie/i }).click()

  // The visible panel.
  const heading = page.getByRole('heading', { name: /zgłoszenie przyjęte/i })
  await expect(heading).toBeVisible({ timeout: 15_000 })

  // The live region is mounted from first paint and filled on success, so a
  // screen reader hears the change rather than a freshly-inserted node.
  await expect(page.getByRole('status')).toContainText('Zgłoszenie przyjęte')

  // FR-7: the panel also takes focus, so the announcement cannot be missed.
  await expect(heading.locator('..')).toBeFocused()
})

test('server-side validation rejects a missing consent and says why', async ({ page }) => {
  await page.goto('/kontakt')
  await fill(page)
  // Consent deliberately left unchecked.

  await page.getByRole('button', { name: /Wyślij zgłoszenie/i }).click()

  await expect(page.getByText('Zgoda jest wymagana', { exact: false })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByRole('heading', { name: /zgłoszenie przyjęte/i })).toHaveCount(0)
})

test('validation errors move focus to the first invalid field', async ({ page }) => {
  await page.goto('/kontakt')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: /Wyślij zgłoszenie/i }).click()

  await expect(page.getByLabel('Imię i nazwisko')).toBeFocused({ timeout: 15_000 })
})

test('the honeypot silently accepts a bot without persisting it', async ({ page }) => {
  await page.goto('/kontakt')
  await fill(page)
  await page.getByRole('checkbox').check()

  // A real visitor never sees this field; only an autofilling bot touches it.
  await page.locator('input[name="website"]').fill('http://spam.example')
  await page.getByRole('button', { name: /Wyślij zgłoszenie/i }).click()

  // A bot must learn nothing from the response: it looks exactly like success.
  await expect(page.getByRole('heading', { name: /zgłoszenie przyjęte/i })).toBeVisible({
    timeout: 15_000,
  })
})
