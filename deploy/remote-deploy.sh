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

npm ci
npx prisma generate
npx prisma db push

if [ ! -f .seeded ]; then
  echo "First deploy: seeding database..."
  npx prisma db seed
  touch .seeded
fi

npm run build

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start npm --name "$APP_NAME" --cwd "$APP_DIR" -- start
fi
pm2 save

# Best-effort: keep pm2 (and this app) running across server reboots.
sudo env PATH="$PATH:$(dirname "$(command -v pm2)")" pm2 startup systemd -u "$(whoami)" --hp "$HOME" >/dev/null 2>&1 || true
