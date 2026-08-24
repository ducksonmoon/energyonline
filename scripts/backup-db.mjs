// Daily hot backup of the SQLite database, run via cron on the server (see
// deploy/remote-deploy.sh). Uses better-sqlite3's online backup API instead
// of copying the file directly, so it's safe to run while the app is live
// and writing to the DB (a plain file copy could grab a half-written page).
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "fs";
import { gzipSync } from "zlib";
import path from "path";

const KEEP_DAYS = 14;

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = path.resolve(dbUrl.replace(/^file:/, ""));
const backupsDir = path.join(path.dirname(dbPath), "backups");

if (!existsSync(dbPath)) {
  console.error(`Database file not found at ${dbPath}`);
  process.exit(1);
}

mkdirSync(backupsDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const tmpPath = path.join(backupsDir, `dev-${stamp}.db`);
const gzPath = `${tmpPath}.gz`;

const db = new Database(dbPath, { readonly: true });
try {
  await db.backup(tmpPath);
} finally {
  db.close();
}

writeFileSync(gzPath, gzipSync(readFileSync(tmpPath)));
unlinkSync(tmpPath);
console.log(`Backup written: ${gzPath}`);

const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
for (const name of readdirSync(backupsDir)) {
  if (!name.startsWith("dev-") || !name.endsWith(".db.gz")) continue;
  const filePath = path.join(backupsDir, name);
  if (statSync(filePath).mtimeMs < cutoff) {
    unlinkSync(filePath);
    console.log(`Pruned old backup: ${name}`);
  }
}
