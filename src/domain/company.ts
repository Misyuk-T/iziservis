/**
 * Facts verified against the live site on 2026-07-10, not taken from the design
 * reference — which invents a phone number, a 24/7 schedule, and "15+ lat".
 *
 * These are the fallbacks. The Settings global overrides them once an editor
 * fills it in; nothing here is a substitute for that, and the LocalBusiness
 * node (AD-4) reads Settings, never this file.
 */
export const COMPANY = {
  legalName: 'IZI Serwis',
  street: 'ul. Urocza 26',
  postalCode: '04-651',
  city: 'Warszawa',
  country: 'PL',
  nip: '5272796292',
  regon: '523058150',

  /** E.164, for `tel:` links. */
  phone: '+48786631714',
  phoneDisplay: '+48 786 631 714',
  email: 'biuro@iziserwis.pl',

  /**
   * Mon–Fri 08:00–17:00. The design reference claims "SERWIS 24/7" and "Serwis
   * 7 dni w tygodniu"; the contact page says otherwise. Shipping 24/7 would put
   * a false claim into structured data. See PRD OQ-5 — unresolved.
   */
  opensAt: '08:00',
  closesAt: '17:00',
  openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const,
  afterHoursNote: 'Wybrane awarie obsługujemy również poza godzinami pracy — zapytaj.',

  /**
   * Nationwide. The reference narrows this to "Warszawa i okolice", which would
   * discard the positioning the current site is built on. See PRD OQ-1.
   */
  areaServed: 'Polska',
} as const
