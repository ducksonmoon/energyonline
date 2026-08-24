#!/usr/bin/env bash
# Runs on the server (via the "Deploy" GitHub Actions workflow) after the app
# files and .env have already been synced into APP_DIR. Idempotent: safe to
# run on every deploy, including the very first one.
set -euo pipefail

APP_DIR="${APP_DIR:?APP_DIR must be set}"
APP_NAME="${APP_NAME:-energyonline}"
cd "$APP_DIR"

node_major() { node -v 2>/dev/null | sed 's/^v//' | cut -d. -f1; }

if ! command -v node >/dev/null 2>&1 || [ "$(node_major)" -lt 20 ]; then
  echo "Installing Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing pm2..."
  sudo npm install -g pm2
fi

if ! command -v make >/dev/null 2>&1 || ! command -v gcc >/dev/null 2>&1; then
  echo "Installing build tools (needed to compile better-sqlite3)..."
  sudo apt-get update
  sudo apt-get install -y build-essential python3
fi

if [ "$(swapon --show=NAME --noheadings 2>/dev/null | wc -l)" -eq 0 ] && [ ! -f /swapfile ]; then
  echo "No swap configured; adding a 2G swapfile (npm ci compiling better-sqlite3 needs more memory than this server has as RAM)..."
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# npm ci always wipes and reinstalls node_modules from scratch, recompiling
# better-sqlite3's native binding every time (several minutes on this
# server's single vCPU, and has previously overloaded it badly enough that
# ssh itself stopped responding). Skip it when the lockfile hasn't actually
# changed since the last deploy.
LOCK_HASH="$(sha256sum package-lock.json | cut -d' ' -f1)"
if [ ! -d node_modules ] || [ "$(cat .lockfile-hash 2>/dev/null)" != "$LOCK_HASH" ]; then
  echo "Dependencies changed (or missing) — running npm ci..."
  npm ci
  echo "$LOCK_HASH" > .lockfile-hash
else
  echo "Dependencies unchanged since last deploy — skipping npm ci."
fi

npx prisma generate
npx prisma db push

if [ ! -f .seeded ]; then
  echo "First deploy: seeding database..."
  npx prisma db seed
  touch .seeded
fi

npm run build

# Bind to loopback only — nginx is the sole public entry point (below), so the
# app is never reachable directly on :3000 without going through TLS.
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 delete "$APP_NAME"
fi
pm2 start npm --name "$APP_NAME" --cwd "$APP_DIR" -- start -- -H 127.0.0.1
pm2 save

# Best-effort: keep pm2 (and this app) running across server reboots.
sudo env PATH="$PATH:$(dirname "$(command -v pm2)")" pm2 startup systemd -u "$(whoami)" --hp "$HOME" >/dev/null 2>&1 || true

# --- nginx reverse proxy + TLS ---------------------------------------------
# The app's session cookie is Secure-only in production, which browsers will
# not store/send over plain HTTP on a public (non-loopback) host — so TLS
# termination here isn't optional, it's what makes admin login work at all.
if ! command -v nginx >/dev/null 2>&1; then
  echo "Installing nginx..."
  sudo apt-get update
  sudo apt-get install -y nginx openssl
fi

SSL_DIR=/etc/nginx/ssl-energyonline
sudo mkdir -p "$SSL_DIR"
if [ ! -f "$SSL_DIR/selfsigned.crt" ]; then
  echo "Generating a self-signed TLS certificate (fallback so HTTPS works immediately; replace with a real cert once a domain points here — see PUBLIC_DOMAIN below)..."
  sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$SSL_DIR/selfsigned.key" -out "$SSL_DIR/selfsigned.crt" \
    -subj "/CN=${PUBLIC_DOMAIN:-$APP_NAME}"
fi

# Static page nginx serves directly (no Node involved) if the app becomes
# unreachable or too slow to respond — so an overloaded backend shows
# visitors a calm "back in a moment" message instead of a broken connection.
MAINTENANCE_DIR=/var/www/energyonline-maintenance
sudo mkdir -p "$MAINTENANCE_DIR"
sudo tee "$MAINTENANCE_DIR/maintenance.html" >/dev/null <<'HTML'
<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>انرژی</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#f6f2ec; color:#141311; font-family:Tahoma,Arial,sans-serif; text-align:center; padding:24px; }
  .box { max-width:420px; }
  h1 { font-size:22px; margin:0 0 12px; }
  p { font-size:14px; line-height:1.9; color:rgba(20,19,17,.65); margin:0; }
</style>
</head>
<body>
  <div class="box">
    <h1>انرژی</h1>
    <p>سایت الان شلوغه، چند لحظه دیگه دوباره امتحان کن.</p>
  </div>
</body>
</html>
HTML

sudo tee /etc/nginx/sites-available/energyonline >/dev/null <<NGINX
limit_req_zone \$binary_remote_addr zone=energyonline:10m rate=30r/s;

server {
    listen 80;
    server_name _;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate     $SSL_DIR/selfsigned.crt;
    ssl_certificate_key $SSL_DIR/selfsigned.key;

    client_max_body_size 10m;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    error_page 502 503 504 /maintenance.html;
    location = /maintenance.html {
        root $MAINTENANCE_DIR;
        internal;
    }

    location / {
        # Generous on purpose: this only guards against one source hammering
        # the server (bots, refresh-spam), not real visitors — Next.js
        # prefetches every product link that scrolls into view, so a single
        # real page load can easily fire dozens of requests in a couple of
        # seconds. Overall traffic from many different visitors at once
        # isn't something per-IP limits address at all (see README).
        limit_req zone=energyonline burst=100 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_connect_timeout 5s;
        proxy_read_timeout 15s;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/energyonline /etc/nginx/sites-enabled/energyonline
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx >/dev/null 2>&1 || true
sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx

# Optional: if a real domain is set (repo variable PUBLIC_DOMAIN) and points
# at this server, swap the self-signed cert for a trusted Let's Encrypt one.
# Best-effort — never fails the deploy, since the self-signed cert above
# already gets HTTPS working regardless.
if [ -n "${PUBLIC_DOMAIN:-}" ]; then
  if ! command -v certbot >/dev/null 2>&1; then
    sudo apt-get install -y certbot python3-certbot-nginx
  fi
  sudo certbot --nginx -d "$PUBLIC_DOMAIN" --non-interactive --agree-tos \
    -m "${CERTBOT_EMAIL:-admin@$PUBLIC_DOMAIN}" --redirect \
    || echo "certbot failed (domain may not point here yet) — continuing with the self-signed cert"
fi

# --- daily database backup ---------------------------------------------
# Everything (products, sales history) lives in this one SQLite file with
# no redundancy — back it up daily so a disk failure doesn't lose it all.
# Uses better-sqlite3's online backup API (safe with the app live), gzips
# the result, and keeps the last 14 days (see scripts/backup-db.mjs).
mkdir -p "$APP_DIR/backups"
NODE_BIN="$(command -v node)"
CRON_CMD="cd $APP_DIR && DATABASE_URL=file:./dev.db $NODE_BIN scripts/backup-db.mjs >> $APP_DIR/backups/backup.log 2>&1"
CRON_LINE="0 4 * * * $CRON_CMD"
# `crontab -l` exits non-zero when the user has no crontab yet (a fresh
# server), and grep -v exits non-zero when nothing matches (also true on a
# fresh server) — either would abort the whole deploy under `set -euo
# pipefail` without the `|| true` here.
{ crontab -l 2>/dev/null | grep -vF "scripts/backup-db.mjs" || true; echo "$CRON_LINE"; } | crontab -
