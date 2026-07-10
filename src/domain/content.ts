import 'server-only'

import { getPayload } from 'payload'

import config from '@payload-config'

/**
 * The only surface `src/app/(site)` may call.
 *
 * The rendering layer never imports a Payload collection or a database client.
 * That is what keeps the admin bundle out of the public bundle, and what makes
 * the CMS replaceable without touching a single page.
 */

const payload = async () => getPayload({ config })

export type EquipmentCategory = {
  id: number | string
  slug: string
  title: string
  summary: string
  order: number
  seo: { title: string; description: string }
}

export type Service = EquipmentCategory

export type Brand = {
  id: number | string
  name: string
  slug: string
  authorized: boolean
  // AD-17 (FR-19): independent from `authorized`. Never inferred one from the
  // other. Drives the "Dystrybucja" badge only when true.
  distributor: boolean
  description?: string | null
  landingPage: boolean
}

export type FaqEntry = {
  id: number | string
  question: string
  answer: string
  topic: string
}

export type Voivodeship = {
  id: number | string
  name: string
  slug: string
}

export async function getEquipmentCategories(): Promise<EquipmentCategory[]> {
  const p = await payload()
  const { docs } = await p.find({
    collection: 'equipment-categories',
    limit: 50,
    depth: 0,
    sort: 'order',
  })
  return docs as unknown as EquipmentCategory[]
}

export async function getEquipmentCategory(slug: string): Promise<EquipmentCategory | null> {
  const p = await payload()
  const { docs } = await p.find({
    collection: 'equipment-categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return (docs[0] as unknown as EquipmentCategory) ?? null
}

export async function getServices(): Promise<Service[]> {
  const p = await payload()
  const { docs } = await p.find({ collection: 'services', limit: 50, depth: 0, sort: 'order' })
  return docs as unknown as Service[]
}

export async function getService(slug: string): Promise<Service | null> {
  const p = await payload()
  const { docs } = await p.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return (docs[0] as unknown as Service) ?? null
}

export async function getBrands(): Promise<Brand[]> {
  const p = await payload()
  const { docs } = await p.find({ collection: 'brands', limit: 100, depth: 0, sort: 'name' })
  return docs as unknown as Brand[]
}

export async function getBrand(slug: string): Promise<Brand | null> {
  const p = await payload()
  const { docs } = await p.find({
    collection: 'brands',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return (docs[0] as unknown as Brand) ?? null
}

export async function getFaqEntries(): Promise<FaqEntry[]> {
  const p = await payload()
  const { docs } = await p.find({ collection: 'faq-entries', limit: 200, depth: 0, sort: 'order' })
  return docs as unknown as FaqEntry[]
}

export async function getVoivodeships(): Promise<Voivodeship[]> {
  const p = await payload()
  const { docs } = await p.find({ collection: 'voivodeships', limit: 20, depth: 0, sort: 'name' })
  return docs as unknown as Voivodeship[]
}

/** FAQ entries grouped by topic, preserving the legacy page's 13-group shape. */
export function groupFaqByTopic(entries: FaqEntry[]): { topic: string; entries: FaqEntry[] }[] {
  const groups = new Map<string, FaqEntry[]>()
  for (const entry of entries) {
    const list = groups.get(entry.topic) ?? []
    list.push(entry)
    groups.set(entry.topic, list)
  }
  return [...groups].map(([topic, entries]) => ({ topic, entries }))
}
