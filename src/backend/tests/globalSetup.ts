import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const testDbPath = path.join(backendRoot, "prisma", "test.db");

// Runs once before the whole suite: creates a fresh SQLite test database from
// the Prisma schema (no migration history needed for a throwaway DB).
export async function setup() {
  process.env.DATABASE_URL = "file:./test.db";
  try {
    rmSync(testDbPath, { force: true });
  } catch {
    // ignore if it does not exist
  }
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    cwd: backendRoot,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
  });
}

export async function teardown() {
  try {
    rmSync(testDbPath, { force: true });
  } catch {
    // ignore
  }
}
