'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { TOPICS } from '@/domain/leadSchema'

import { submitLead, type FormState } from './actions'

type Voivodeship = { id: number | string; name: string }

const initial: FormState = { status: 'idle' }

/**
 * FR-7: the form is fully operable without sight or a mouse.
 *
 * Every input has a real <label>. Required fields expose aria-required, invalid
 * ones expose aria-invalid and point at their message via aria-describedby. On
 * failure focus moves to the first invalid field; on success the confirmation
 * is announced through a live region and takes focus. Errors are never signalled
 * by colour alone.
 */
export function ContactForm({ voivodeships }: { voivodeships: Voivodeship[] }) {
  const [state, action, pending] = useActionState(submitLead, initial)
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === 'error' && state.fieldErrors) {
      const first = Object.keys(state.fieldErrors)[0]
      if (first) {
        const el = formRef.current?.elements.namedItem(first)
        if (el instanceof HTMLElement) el.focus()
      }
    }
    if (state.status === 'success') successRef.current?.focus()
  }, [state])

  if (state.status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-brand-green/40 bg-brand-green/5 p-8"
      >
        <h2 className="text-xl font-semibold text-green-900">Dziękujemy — zgłoszenie przyjęte.</h2>
        <p className="mt-2 text-green-900/75">
          Odezwiemy się najszybciej, jak to możliwe. Jeśli sprawa jest pilna, zadzwoń.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} action={action} noValidate className="space-y-5">
      {/* Announced to assistive tech the moment a server error lands. */}
      <div aria-live="polite" className="sr-only">
        {state.status === 'error' ? state.message : ''}
      </div>

      {state.status === 'error' && state.message ? (
        <p className="rounded-xl border border-red-700/30 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Imię i nazwisko" required error={state.fieldErrors?.name} />
        <Field name="email" type="email" label="E-mail" required error={state.fieldErrors?.email} />
        <Field name="company" label="Nazwa firmy / lokal" required error={state.fieldErrors?.company} />
        <Field name="phone" type="tel" label="Numer telefonu" required error={state.fieldErrors?.phone} />

        <SelectField name="voivodeship" label="Województwo" required error={state.fieldErrors?.voivodeship}>
          <option value="">Wybierz…</option>
          {voivodeships.map((v) => (
            <option key={v.id} value={String(v.id)}>
              {v.name}
            </option>
          ))}
        </SelectField>

        <SelectField name="topic" label="Temat" required error={state.fieldErrors?.topic}>
          <option value="">Wybierz…</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
      </div>

      <Field
        name="message"
        label="Treść wiadomości / opis problemu"
        required
        textarea
        error={state.fieldErrors?.message}
      />

      {/* Honeypot. Hidden from everyone, including screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="website">Nie wypełniaj tego pola</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Consent error={state.fieldErrors?.consent} />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-action-green px-8 font-semibold text-text-on-dark transition-transform duration-200 motion-safe:hover:scale-[1.02] disabled:opacity-60"
      >
        {pending ? 'Wysyłanie…' : 'Wyślij zgłoszenie'}
      </button>

      <p className="text-sm text-green-900/60">Pola oznaczone * są wymagane.</p>
    </form>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required,
  textarea,
  error,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  textarea?: boolean
  error?: string
}) {
  const id = useId()
  const errorId = `${id}-error`
  const shared = {
    id,
    name,
    required,
    'aria-required': required,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    className: `w-full rounded-xl border px-4 py-3 text-green-900 transition-colors ${
      error ? 'border-red-700' : 'border-green-900/20'
    }`,
  }

  return (
    <div className={textarea ? '' : undefined}>
      <label htmlFor={id} className="block text-sm font-medium text-green-900">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className="mt-2">
        {textarea ? (
          <textarea {...shared} rows={5} />
        ) : (
          <input {...shared} type={type} autoComplete={autoCompleteFor(name)} />
        )}
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  )
}

function SelectField({
  name,
  label,
  required,
  error,
  children,
}: {
  name: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-green-900">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 text-green-900 ${
          error ? 'border-red-700' : 'border-green-900/20'
        }`}
      >
        {children}
      </select>
      <FieldError id={errorId} error={error} />
    </div>
  )
}

function Consent({ error }: { error?: string }) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name="consent"
          type="checkbox"
          required
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="mt-1 size-5 shrink-0 rounded border-green-900/30"
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-green-900/80">
          Oświadczam, że zapoznałem/am się z{' '}
          <a href="/polityka-cookies" className="font-medium text-link-green underline underline-offset-2">
            Polityką prywatności
          </a>{' '}
          i wyrażam zgodę na przetwarzanie moich danych w celu obsługi zgłoszenia.
          <span aria-hidden="true"> *</span>
        </label>
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  )
}

/** Errors carry a text marker, never colour alone (WCAG 1.4.1). */
function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={id} className="mt-2 text-sm font-medium text-red-800">
      <span aria-hidden="true">⚠ </span>
      {error}
    </p>
  )
}

function autoCompleteFor(name: string): string | undefined {
  const map: Record<string, string> = {
    name: 'name',
    email: 'email',
    phone: 'tel',
    company: 'organization',
  }
  return map[name]
}
