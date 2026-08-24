# انرژی — فروشگاه پوشاک

Persian-language, RTL storefront for "انرژی" (Energy), a clothing shop in Sari, Iran, plus an
admin dashboard for managing products, stock, discounts, categories, and store settings.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-ui primitives) for the admin dashboard
- **Prisma 7** + **SQLite** (via `@prisma/adapter-better-sqlite3` driver adapter)
- Custom **JWT session auth** (`jose` + `bcryptjs`) for the single admin login — no external auth
  service required
- **Framer Motion** for storefront animations
- **Zustand** (persisted to `localStorage`) for the client-side cart

## Getting started

```bash
npm install
cp .env.example .env   # then edit SESSION_SECRET / ADMIN_USERNAME / ADMIN_PASSWORD
npx prisma db push     # creates dev.db from prisma/schema.prisma
npx prisma db seed     # seeds categories, the original 8 products, store settings, admin user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and
[http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard (login with the
`ADMIN_USERNAME` / `ADMIN_PASSWORD` from your `.env`).

**Change the default admin password before deploying anywhere reachable from the internet.**

## Project layout

- `src/app/page.tsx` — storefront (Server Component data fetch + `StorefrontApp` client island)
- `src/app/admin/login` — admin login (outside the auth guard)
- `src/app/admin/(dashboard)` — overview, products, discounts, categories, settings (route group,
  guarded by `src/proxy.ts` + a server-side session check in its layout)
- `src/lib` — `db.ts` (Prisma singleton), `auth.ts` (sessions), `queries.ts`, `derived.ts` /
  `format.ts` (stock/price/Persian-numeral helpers), `productViewModel.ts`
- `src/components/storefront` / `src/components/admin` — UI split by app area
- `prisma/schema.prisma`, `prisma/seed.ts` — data model and seed data

## Notes

- Uploaded product images are written to `public/uploads/products/<id>/` and referenced by URL in
  the DB; products without an image fall back to the original icon placeholder.
- The cart has no checkout flow by design — matching the original store concept, orders are
  coordinated via Instagram DM (see the cart drawer and the Instagram CTA section).
- `npx prisma studio` (needs `DATABASE_URL` in the environment) is a quick way to browse/edit the
  SQLite data directly during development.

## Production build

```bash
npm run build
npm run start
```

## Deploying

Pushes to `master` trigger `.github/workflows/deploy.yml`, which rsyncs the repo to a server over
SSH, then runs `deploy/remote-deploy.sh` there: installs Node 20 / pm2 if missing, `npm ci`,
`prisma generate` + `prisma db push`, seeds the DB on first deploy only, `npm run build`, and
(re)starts the app under pm2 as `energyonline`. You can also run it manually from the **Actions**
tab (`workflow_dispatch`).

Configure these before the first run:

- **Repository secrets** (Settings → Secrets and variables → Actions → *Secrets*):
  `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY` (private key with access to the server),
  `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
- **Repository variables** (same page, *Variables* tab, optional): `APP_DIR` (default
  `/home/ubuntu/apps/energyonline`), `APP_NAME` (default `energyonline`).

The server itself only needs SSH access and `sudo` for the (idempotent) Node/pm2 install steps —
everything else is handled by the workflow. The app listens on port 3000 under pm2; put a reverse
proxy (e.g. nginx) in front of it for a domain and TLS.
