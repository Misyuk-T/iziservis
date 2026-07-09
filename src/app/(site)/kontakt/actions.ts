'use server'

import { getPayload } from 'payload'

import config from '@payload-config'

import { COMPANY } from '@/domain/company'
import { isBot, leadSchema } from '@/domain/leadSchema'
import { hasEmail } from '@/env'

export type FormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

/**
 * AD-8: a lead is persisted before it is mailed.
 *
 * The contact form is the site's only revenue event. If SMTP is down, the lead
 * must still exist — so the write happens first, and delivery is a side effect
 * that can fail, be recorded, and be retried without the visitor ever seeing it.
 *
 * FR-14: routing is CMS content. A voivodeship with no advisor falls back to
 * biuro@iziserwis.pl. An unmapped region degrades to delivered, never to
 * dropped.
 */
export async function submitLead(_prev: FormState, formData: FormData): Promise<FormState> {
  // Before validation, so a bot never receives an error naming the honeypot.
  if (isBot(formData)) return { status: 'success' }

  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company'),
    phone: formData.get('phone'),
    voivodeship: formData.get('voivodeship'),
    topic: formData.get('topic'),
    message: formData.get('message'),
    consent: formData.get('consent') === 'on',
  }

  const parsed = leadSchema.safeParse(raw)

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0])
      fieldErrors[key] ??= issue.message
    }
    return { status: 'error', message: 'Sprawdź zaznaczone pola.', fieldErrors }
  }

  const payload = await getPayload({ config })

  // The select carries the voivodeship's numeric id as a string.
  const voivodeshipId = Number(parsed.data.voivodeship)
  if (!Number.isInteger(voivodeshipId)) {
    return {
      status: 'error',
      message: 'Sprawdź zaznaczone pola.',
      fieldErrors: { voivodeship: 'Wybierz województwo' },
    }
  }

  let leadId: string | number
  try {
    const lead = await payload.create({
      collection: 'leads',
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company,
        phone: parsed.data.phone,
        voivodeship: voivodeshipId,
        topic: parsed.data.topic,
        message: parsed.data.message,
        consent: true,
        consentAt: new Date().toISOString(),
      },
    })
    leadId = lead.id
  } catch {
    // Nothing was written, so nothing is half-done. Tell the truth.
    return {
      status: 'error',
      message: `Nie udało się zapisać zgłoszenia. Zadzwoń: ${COMPANY.phoneDisplay}`,
    }
  }

  // The lead is safe from here on. Delivery failure never fails the request.
  //
  // `deliveredAt` is only stamped when a notification genuinely left the
  // building. Payload's sendEmail resolves happily with no adapter configured —
  // it just logs — so stamping it unconditionally told staff a lead had been
  // routed when nothing had been sent.
  if (!hasEmail) {
    await payload
      .update({
        collection: 'leads',
        id: leadId,
        data: { deliveryError: 'No SMTP transport configured; notification not sent.' },
      })
      .catch(() => {})

    return { status: 'success' }
  }

  try {
    // `disableErrors` because findByID throws NotFound for an absent id, which
    // would skip sendEmail entirely — the "dropped, never delivered" outcome
    // FR-14 exists to prevent. A missing region falls back to the general inbox.
    const region = await payload.findByID({
      collection: 'voivodeships',
      id: voivodeshipId,
      depth: 0,
      disableErrors: true,
    })

    const to = region?.advisorEmail || COMPANY.email

    await payload.sendEmail({
      to,
      subject: `[${parsed.data.topic}] ${parsed.data.company}`,
      text: [
        `Imię i nazwisko: ${parsed.data.name}`,
        `E-mail: ${parsed.data.email}`,
        `Telefon: ${parsed.data.phone}`,
        `Firma / lokal: ${parsed.data.company}`,
        `Temat: ${parsed.data.topic}`,
        '',
        parsed.data.message,
      ].join('\n'),
    })
  } catch (error) {
    // Record why, against the lead. Never log the lead's contents — only its id.
    const reason = error instanceof Error ? error.message : 'unknown'
    payload.logger.error({ leadId, reason }, 'lead notification failed')

    await payload
      .update({ collection: 'leads', id: leadId, data: { deliveryError: reason.slice(0, 250) } })
      .catch(() => {})

    return { status: 'success' }
  }

  // Stamped in its own step: if this write fails, the mail still went out, and
  // an unstamped-but-delivered lead is better than a duplicate outreach.
  await payload
    .update({ collection: 'leads', id: leadId, data: { deliveredAt: new Date().toISOString() } })
    .catch((error: unknown) => {
      payload.logger.warn({ leadId, error }, 'lead delivered but deliveredAt not stamped')
    })

  return { status: 'success' }
}
