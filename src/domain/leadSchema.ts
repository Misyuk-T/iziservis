import { z } from 'zod'

/**
 * One schema, validated on both sides. The client uses it for instant feedback;
 * the route handler re-validates because client validation is a convenience,
 * never a control.
 *
 * FR-16: no CAPTCHA. A honeypot plus server-side rate limiting is enough at
 * this traffic volume, and a visual challenge would exclude exactly the users
 * FR-7 exists to include.
 */
export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Podaj imię i nazwisko'),
  email: z.string().trim().email('Podaj poprawny adres e-mail'),
  company: z.string().trim().min(2, 'Podaj nazwę firmy lub lokalu'),
  phone: z
    .string()
    .trim()
    .min(9, 'Podaj numer telefonu')
    .regex(/^[+0-9 ()-]+$/, 'Numer telefonu może zawierać tylko cyfry i znaki + ( ) -'),
  voivodeship: z.string().min(1, 'Wybierz województwo'),
  topic: z.enum(['Serwis', 'Przegląd', 'Wycena', 'Zapytanie ogólne'], {
    message: 'Wybierz temat',
  }),
  message: z.string().trim().min(10, 'Opisz problem w co najmniej 10 znakach'),
  consent: z.literal(true, { message: 'Zgoda jest wymagana, aby wysłać zgłoszenie' }),

  /** Honeypot. Real users never see this field, so a filled value is a bot. */
  website: z.string().max(0).optional(),
})

export type LeadInput = z.infer<typeof leadSchema>

export const TOPICS = ['Serwis', 'Przegląd', 'Wycena', 'Zapytanie ogólne'] as const
