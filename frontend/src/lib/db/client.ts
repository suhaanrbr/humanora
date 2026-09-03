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
    // DATABASE_URL points at Neon's pooled (PgBouncer) endpoint — its
    // hostname carries "-pooler" — so a handful of app-level connections
    // per warm Vercel instance is safe; PgBouncer multiplexes them onto
    // Neon's actual Postgres backends rather than holding one each.
    // Pages like /dashboard and /profile fire ~8-9 independent queries
    // concurrently (Promise.all/allSettled) to paint all their panels
    // in parallel; max: 1 forced those onto a single connection and
    // serialized what should've been parallel work, which is what made
    // /dashboard take ~15s. Keep this comfortably under Neon's free-tier
    // pooled connection ceiling, since several instances can be warm at
    // once.
    max: 10,
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
