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

## Planning

Planning and implementation artifacts are produced with
[BMAD](https://bmadcode.com/) (v6.10.0, `bmm` module), installed under
`_bmad/`. Output lands in `docs/planning/` and `docs/stories/`.

Config that the installer must not regress is pinned in
`_bmad/custom/config.toml`.
