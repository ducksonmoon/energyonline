# انرژی — فروشگاه پوشاک

Persian-language, RTL storefront for "انرژی" (Energy), an original-Turkish-clothing shop with a
branch in Sari, Iran, plus an admin dashboard for managing products, stock, discounts, categories,
and store settings.

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
(re)starts the app under pm2 as `energyonline` (bound to `127.0.0.1` only). It also installs and
configures **nginx as a TLS-terminating reverse proxy** in front of it — this isn't cosmetic: the
admin session cookie is `Secure`-only in production, which browsers won't store over plain HTTP on
a public host, so without TLS the admin panel can't stay logged in. You can also run the workflow
manually from the **Actions** tab (`workflow_dispatch`).

Configure these before the first run:

- **Repository secrets** (Settings → Secrets and variables → Actions → *Secrets*):
  `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY` (private key with access to the server),
  `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
- **Repository variables** (same page, *Variables* tab, optional): `APP_DIR` (default
  `/home/ubuntu/apps/energyonline`), `APP_NAME` (default `energyonline`), `SERVER_PORT` (default
  `22`), `PUBLIC_DOMAIN` / `CERTBOT_EMAIL` (see below), `GA_MEASUREMENT_ID` / `CLARITY_PROJECT_ID`
  (see below).

The server itself only needs SSH access and `sudo` for the (idempotent) install steps — everything
else is handled by the workflow.

**TLS certificate**: with no `PUBLIC_DOMAIN` set, nginx serves a self-signed certificate — HTTPS
works immediately (so cookies/logins work) but browsers show an untrusted-certificate warning,
since it isn't issued by a real CA. Once you have a domain pointed at the server's IP, set the
`PUBLIC_DOMAIN` repository variable (and optionally `CERTBOT_EMAIL`) and re-run the workflow: it'll
request a trusted Let's Encrypt certificate via certbot and switch nginx over to it automatically.

**Analytics**: optional, off by default. Set the `GA_MEASUREMENT_ID` repository variable (from
[analytics.google.com](https://analytics.google.com), looks like `G-XXXXXXXXXX`) and/or
`CLARITY_PROJECT_ID` (from [clarity.microsoft.com](https://clarity.microsoft.com)) and re-run the
workflow. Both only load on the public storefront, never in `/admin`.

**SEO**: each product has its own indexable page at `/product/[id]` (proper `<title>`/description,
Open Graph + Twitter cards, JSON-LD `Product` schema), plus `/sitemap.xml` and `/robots.txt`
(`/admin` is excluded from both). All of it needs an absolute site URL to be correct — canonical
links, the sitemap, and social-share image previews are otherwise relative/broken. That URL is
derived automatically from `PUBLIC_DOMAIN` (see TLS above), so **SEO only really works once you
have a real domain** — a self-signed IP address won't rank or preview properly regardless of the
metadata.

## Traffic & reliability

The server is a single small VPS (1 vCPU / 1GB RAM), so a launch-day traffic spike is a real risk.
**Load balancing across multiple app servers isn't the fix** — everything is stored in one SQLite
file (see "Getting started" above), and SQLite doesn't support concurrent writes from multiple
hosts, so running the app on more than one server would need a database migration (to Postgres or
similar) first. That's a much bigger, riskier change than makes sense to rush before a launch.

What's actually in place instead:

- **Page caching** — the storefront and product pages are cached for up to 60 seconds
  (`export const revalidate = 60`), so repeated visitors hit a cached response instead of a fresh
  database query + render every time. Admin actions (sales, price/stock edits) call
  `revalidatePath` on every change, so real updates still show up immediately — the 60s is just a
  ceiling for anything that isn't explicitly invalidated.
- **Rate limiting** (nginx, 30 req/s per IP, generous burst) — blunts a single abusive source (bot,
  refresh-spam) hammering the server; it does not throttle overall traffic from many different
  visitors, since each gets its own independent limit.
- **A friendly fallback page** — if the app becomes unreachable or too slow (nginx gives it 15s),
  nginx serves a static "site's busy, try again shortly" page directly instead of visitors seeing a
  broken connection.

What would meaningfully help further, and needs your call (cost/infra decisions, not code):

1. **Upgrade the VPS plan** (more RAM/vCPU) — the most direct fix. This server has visibly
   struggled under load already (a routine deploy once overloaded it badly enough that SSH itself
   stopped responding); 1GB RAM is genuinely tight for concurrent real traffic on top of the app
   itself. 2GB+ would meaningfully raise the ceiling.
2. **Put the site behind Cloudflare** (free tier) once you have a real domain — it caches pages at
   the edge and absorbs traffic spikes without the origin server seeing most of the requests at
   all. This is the standard, low-effort way to protect a small origin server during a launch, but
   needs a domain pointed through Cloudflare's nameservers first (see `PUBLIC_DOMAIN` above).

## Backups

Every deploy sets up a daily cron job (4am server time) that hot-backs-up the SQLite database with
`scripts/backup-db.mjs` — safe to run while the app is live — gzips it, and keeps the last 14 days
in `backups/` on the server (excluded from deploy syncs, so it survives every deploy). This is the
single point of failure for the whole store (every product, sale, and price lives in that one
file), so it's on by default rather than optional. To restore: `gunzip` the backup and copy it over
`dev.db` (with the app stopped), or point `DATABASE_URL` at it directly to inspect first.
