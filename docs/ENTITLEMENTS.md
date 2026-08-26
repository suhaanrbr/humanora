# HUMANORA entitlement system

## The rule

Every account gets **one lifetime complimentary humanization**, capped at
**200 characters** of input.

- Character count is `text.trim().length` — plain JavaScript string
  length after trimming leading/trailing whitespace. Spaces and
  punctuation count like any other character. This is a UTF-16 code-unit
  count (JavaScript's native `.length`), not a grapheme-cluster count —
  acceptable for this limit's purpose (a rough fairness/cost cap, not a
  precise linguistic measure).
- It does **not** reset daily, weekly, monthly, on logout, on browser
  refresh, on cookie deletion, or on a new device. The database
  (`user_entitlement.free_trial_used`) is the only source of truth.
- It is consumed **only** after HUMANORA delivers a real, successful
  result — never on a button click, validation failure, Gemini failure,
  timeout, or any other error. See "Reserve, then commit or release"
  below.
- Submitting **more than 200 characters** while the trial is unused does
  **not** consume it — the request is rejected before Gemini is ever
  called, and the trial remains available for a later, shorter attempt.
  This is intentional: a user who pastes a long draft first should still
  get to use their complimentary transformation once they trim it down.

## Reserve, then commit or release

`POST /api/humanize` (see `app/api/humanize/route.ts`):

1. Resolve the user's plan (`free`, or a paid plan if their subscription
   is active).
2. **Free plan:** check `free_trial_used`. If already used → 402. If the
   input exceeds 200 chars → 402, trial untouched. Otherwise, **reserve**
   the trial (see below) before calling Gemini.
3. **Paid plan:** atomically reserve one unit of the monthly quota
   before calling Gemini (same pattern, different table).
4. Call Gemini. On success: record usage, save history, return the
   result — the reservation stands.
5. On **any** failure (Gemini error, network error, unexpected
   exception): release the reservation, so the user doesn't lose their
   complimentary use (or a paid quota unit) to an infrastructure
   failure that produced no actual value.

## Concurrency guarantee

`reserveFreeTrial()` (`lib/db/entitlement.ts`) is a single conditional
`UPDATE`:

```sql
UPDATE user_entitlement
SET free_trial_used = true, free_trial_used_at = now()
WHERE user_id = $1 AND free_trial_used = false
RETURNING user_id;
```

Postgres takes a row-level lock for the duration of an `UPDATE`.
Concurrent `UPDATE`s against the same row serialize against that lock,
and each one re-evaluates its `WHERE` clause against the row's
just-committed value before matching — so if 10 requests hit this
simultaneously, at most one can ever see `free_trial_used = false` and
flip it. No advisory lock, explicit transaction, or unique constraint
trick is needed; the `UPDATE`'s own row lock **is** the mutex. The exact
same pattern (`checkAndReserveQuota` in `lib/db/usage.ts`) protects paid
monthly quotas from the same class of race.

**A second, subtler race exists on first-ever row creation** for a
brand-new user: naive "SELECT, then INSERT if missing" logic lets
multiple concurrent first requests all see "no row" and all attempt the
INSERT, and every one after the first throws a primary-key violation.
All `getOrCreate*` helpers in this codebase (`entitlement.ts`,
`usage.ts`, `voice.ts`) use `INSERT ... ON CONFLICT DO NOTHING` followed
by a `SELECT`, which is safe under concurrency — closing this gap was
found and fixed via the test below.

### Verified

A 10-parallel-request test against a fresh account (`curl ... &` × 10,
`wait`) produced exactly 1 `200` success and 9 `402 free_trial_used`
responses — no `500`s, no double-consumption, no duplicate history rows.
Re-run this test after any change to `lib/db/entitlement.ts` or
`lib/db/usage.ts`.

## What's NOT yet built

- Payment-gated plan upgrades (Essential/Pro/Ultra) — the paywall UI
  exists and shows real prices from `lib/config/plans.ts`, but the
  "Choose plan" action is intentionally disabled ("Coming soon") until
  a payment provider is connected. See `docs/PAYMENTS_SETUP.md`.
- Signup-abuse prevention beyond what Better Auth provides natively
  (e.g. IP-based signup throttling) — flagged as a known gap, not yet
  implemented.
