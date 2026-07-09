'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

/**
 * Embla is headless, so the accessibility is ours to get right.
 *
 * - The viewport is a labelled group, and each slide announces its position.
 * - Previous/Next are real buttons with text labels, disabled at the ends, so
 *   keyboard users are never stranded and screen readers never see a bare icon.
 * - Slides scrolled out of view are `inert`. `overflow-hidden` only clips them
 *   visually: without this, a link inside an off-screen slide stays in the tab
 *   order, and focus lands on something the visitor cannot see (WCAG 2.4.3,
 *   2.4.7). Harmless for today's static wordmarks, a trap the moment a slide
 *   holds a link.
 * - There is no autoplay. WCAG 2.2.2 would then require a pause control, and a
 *   logo wall that moves on its own earns nothing.
 */
export function Carousel({
  children,
  label,
  className,
}: {
  children: ReactNode[]
  label: string
  className?: string
}) {
  const [ref, embla] = useEmblaCarousel({ align: 'start', loop: false, containScroll: 'trimSnaps' })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [inView, setInView] = useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!embla) return
    setCanPrev(embla.canScrollPrev())
    setCanNext(embla.canScrollNext())
    setInView(embla.slidesInView())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    onSelect()
    embla.on('select', onSelect).on('reInit', onSelect).on('slidesInView', onSelect)
    return () => {
      embla.off('select', onSelect).off('reInit', onSelect).off('slidesInView', onSelect)
    }
  }, [embla, onSelect])

  return (
    <div className={className}>
      <div className="overflow-hidden" ref={ref}>
        <div role="group" aria-roledescription="carousel" aria-label={label} className="flex gap-6">
          {children.map((child, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} z ${children.length}`}
              // Before Embla initialises, `inView` is empty — do not inert everything.
              inert={inView.length > 0 && !inView.includes(i)}
              className="min-w-0 shrink-0 grow-0 basis-1/2 sm:basis-1/3 lg:basis-1/5"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <CarouselButton onClick={() => embla?.scrollPrev()} disabled={!canPrev}>
          Poprzednie
        </CarouselButton>
        <CarouselButton onClick={() => embla?.scrollNext()} disabled={!canNext}>
          Następne
        </CarouselButton>
      </div>
    </div>
  )
}

function CarouselButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 min-w-11 rounded-full border border-green-900/20 px-4 text-sm font-medium text-green-900 transition-opacity duration-200 disabled:opacity-40"
    >
      {children}
    </button>
  )
}
