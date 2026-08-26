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

  const sql = postgres(url, {
    max: 1,
    // Serverless-safe connection lifecycle: a module-level client like
    // this one is reused across invocations on a warm Vercel function
    // instance, but the underlying TCP socket can go stale while the
    // instance is frozen between requests (Neon closes idle server-side
    // connections; a frozen container has no chance to notice). Without
    // these, the FIRST query after such a gap throws a connection error
    // — which, upstream, auth's fail-closed session check was treating
    // identically to "not logged in" and bouncing valid users to
    // /login. Closing idle connections proactively and recycling
    // long-lived ones means postgres.js reconnects on its own before
    // that happens, instead of handing the app a dead-socket error.
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 30 * 60,
  });
  cached = drizzle(sql, { schema });
  return cached;
}
