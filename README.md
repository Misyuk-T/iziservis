# iziservis

Redesign of [iziserwis.pl](https://iziserwis.pl) — a Warsaw-based service
company for professional catering (HoReCa) kitchen equipment.

The current site is WordPress. This project replaces it with a custom
front-end, a headless CMS on a separate route, and Supabase as the backend.
Accessibility and SEO are first-class requirements, not a follow-up pass.

## Status

Discovery. Nothing is built yet.

The legacy site has been crawled and recorded so the redesign can't silently
drop content, URLs, or ranking signals:

- [docs/source/legacy-site-audit.md](docs/source/legacy-site-audit.md) — what
  the site is, what's broken, what must be preserved
- [docs/source/content-inventory.md](docs/source/content-inventory.md) — all 22
  pages with titles, descriptions, heading outlines
- [docs/source/legacy-site-scrape.json](docs/source/legacy-site-scrape.json) —
  the raw capture
- [docs/design/reference-analysis.md](docs/design/reference-analysis.md) — the
  homepage concept, its palette, and where it contradicts the business

## Decisions

- **CMS:** Payload, mounted as a route inside the Next.js app, backed by the
  same Supabase Postgres. Chosen over a hand-rolled admin (drafts, versions,
  media, roles come for free) and over external SaaS (keeps content in one
  database).
- **Media `alt` is a required field.** The legacy site's largest single defect
  is 244 images with no alt text; the content model makes that impossible
  rather than merely discouraged.

## Planning

Planning and implementation artifacts are produced with
[BMAD](https://bmadcode.com/) (v6.10.0, `bmm` module), installed under
`_bmad/`. Output lands in `docs/planning/` and `docs/stories/`.

Config that the installer must not regress is pinned in
`_bmad/custom/config.toml`.
