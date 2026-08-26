import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * Lazily-created DB client, over a standard TCP connection (postgres.js)
 * rather than Neon's websocket-based serverless driver — the websocket
 * driver proved unreliable in this project's dev sandbox (hung
 * indefinitely on connect). Plain TCP works identically against Neon
 * and is what drizzle-kit uses for migrations too, so app runtime and
 * migration tooling stay consistent.
 *
 * Reading `process.env.DATABASE_URL` at call time (not at module load)
 * means the app still builds and every public marketing page still
 * works even before a database is connected — only code paths that
 * actually need the DB (auth, history, usage) will throw, and only when
 * they're actually invoked.
 */
let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. HUMANORA's account/history features require a Neon Postgres connection string — see docs/PHASE_2_SETUP.md."
    );
  }

  const sql = postgres(url, { max: 1 });
  cached = drizzle(sql, { schema });
  return cached;
}
