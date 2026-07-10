import type { Metadata } from 'next'
import Image from 'next/image'

import { Reveal } from '@/components/motion/Reveal'
import { PageHeader, Prose, Section } from '@/components/ui/Section'
import { getBrands } from '@/domain/content'

export const metadata: Metadata = {
  title: 'O firmie - Izi Serwis',
  description: 'IZI Serwis – precyzja technologii w służbie sztuki kulinarnej',
  alternates: { canonical: '/o-firmie' },
}

export default async function AboutPage() {
  const authorized = (await getBrands()).filter((b) => b.authorized)

  return (
    <>
      <PageHeader
        eyebrow="O firmie"
        title="Precyzja technologii w służbie sztuki kulinarnej"
        lead="Z doświadczenia w terenie, z wizją na nową jakość w branży."
      />

      <Section>
        <Reveal>
          {/* Prose left, team photo right on lg; stacked (photo below prose) on mobile. */}
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <Prose>
              <p>
                IZI Serwis powstał z praktyki — z lat spędzonych przy piecach, zmywarkach i
                ekspresach w kuchniach, które nie mogą sobie pozwolić na przestój. Wiemy, że awaria o
                jedenastej rano to nie usterka sprzętu, tylko stracony serwis.
              </p>
              <p>
                Serwisujemy urządzenia gastronomiczne w całej Polsce. Prowadzimy naprawy awaryjne,
                przeglądy okresowe, instalacje i deinstalacje, a także doradzamy przy doborze
                sprzętu. Obsługujemy pojedyncze lokale i sieci — w każdej skali.
              </p>
            </Prose>

            {/*
              Real dimensions (1400x934) set on next/image, so the box reserves
              its aspect ratio before load — no CLS. Below the fold, so lazy.
            */}
            <div className="overflow-hidden rounded-2xl border border-green-900/10">
              <Image
                src="/o-firmie/zespol.jpg"
                alt="Dwoje kucharzy przy pracy w profesjonalnej kuchni gastronomicznej"
                width={1400}
                height={934}
                loading="lazy"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </Section>

      <Section dark className="!pt-0">
        <Reveal>
          <h2 className="text-2xl font-bold sm:text-3xl">Autoryzacje</h2>
          <p className="mt-3 max-w-2xl text-muted-on-dark">
            Jesteśmy oficjalnym partnerem serwisowym i/lub dystrybutorem tych producentów. To
            oznacza szkolenia u producenta, dostęp do oryginalnych części i naprawy bez utraty
            gwarancji.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {authorized.map((brand) => (
              <li key={brand.slug} className="rounded-full border border-brand-green/40 px-5 py-2 font-medium">
                {brand.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>
    </>
  )
}
