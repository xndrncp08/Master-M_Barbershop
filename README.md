# Master M Barbershop

Client-facing website & online booking for **Master M Barbershop** — 15425 Bannister Rd SE #10, Calgary, AB T2X 3E9 · (403) 475-5662.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Anime.js and Zod.

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev                  # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build & server |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit & component tests |
| `npm run test:e2e` | Playwright end-to-end tests (builds & starts the app on port 3100) |

First Playwright run: `npx playwright install chromium`.

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical origin for metadata, sitemap, robots & JSON-LD. Enables `upgrade-insecure-requests` when `https://`. |
| `NEXT_PUBLIC_GOOGLE_RATING`, `NEXT_PUBLIC_GOOGLE_REVIEW_COUNT` | No | Real Google rating shown on the OG card. Never invented — omitted unless both are set. |
| `BOOKING_WEBHOOK_URL` | Recommended | Receives each new booking as JSON (`{ type: "booking.created", booking }`). |

## Project Structure

```
app/                  Routes: / · /services · /book · /contact, API routes, OG image, sitemap, robots, manifest
  api/availability    GET live slot states (rate-limited)
  api/bookings        POST booking (rate-limited, Zod-validated)
  book/actions.ts     Server Action used by the booking form (own rate limiter)
components/
  booking/            Multi-step booking engine, slot picker, form, confirmation + confetti
  layout/             Header & footer
  seo/                JSON-LD renderer
  ui/                 Logo, magnetic buttons, tilt cards, reveals, Anime.js line art, status badge
lib/
  site.ts             Business profile (address, phone, geo, Linktree)
  hours.ts, time.ts   Opening hours & Calgary-time open/closed logic
  services.ts         Service catalog & pricing
  booking/            Barbers, slots, Zod schemas, URL state, store, booking service
  seo/                JSON-LD & metadata builders
  rate-limit.ts       Sliding-window limiter
proxy.ts              Rate limiting for /api/* (Next.js 16 "proxy", formerly middleware)
MasterM/logo/         Source brand asset (resized copies live in public/brand and app/icon.png)
__tests__/            Vitest suites
e2e/                  Playwright suites
```

## Editing Content

- **Prices & services:** `lib/services.ts` (prices are placeholders until confirmed by the shop).
- **Hours:** `lib/hours.ts` — feeds the footer, contact page, status badge, booking slots & JSON-LD.
- **Barbers:** `lib/booking/barbers.ts`.

## Production Notes

- **Booking storage is in-memory.** Bookings persist only for the life of the server process. Configure `BOOKING_WEBHOOK_URL` and/or replace `lib/booking/store.ts` with a database or the shop's booking system before taking real appointments.
- **Rate limits are per instance.** Swap the Map in `lib/rate-limit.ts` for a shared store (e.g. Upstash Redis) on multi-instance hosting.
- **CSP** allows `'unsafe-inline'` scripts/styles because Next.js inlines hydration scripts on statically rendered pages; everything else (framing, plugins, third-party origins, form targets) is locked down.
