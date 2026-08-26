import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";

/**
 * HUMANORA database schema (Drizzle ORM, Postgres/Neon).
 *
 * `user`, `session`, `account`, `verification` are Better Auth's required
 * tables (shape dictated by its Drizzle adapter — do not rename columns).
 * Everything below that is HUMANORA's own data model.
 *
 * Deliberately NOT built yet (left as extension points, not tables,
 * until there's a real product need):
 *   - voice_samples (individual uploaded writing samples) — Phase 3,
 *     once My Voice moves past "profile exists" to "profile has content".
 *   - a separate `subscriptions` table — folded into `usagePeriod` below
 *     since there is no billing yet; split out once Stripe is introduced.
 */

// ---------------------------------------------------------------------------
// Better Auth core tables
// ---------------------------------------------------------------------------

// Shape below matches Better Auth's own CLI-generated schema exactly
// (`npx @better-auth/cli generate`) — hand-editing these column sets
// previously caused a subtle runtime mismatch ("issuer" field error)
// against what the adapter actually expects at query time. Do not
// diverge from the generated shape without regenerating and re-diffing.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    // Required by better-auth@1.7.x even for the credential (email/
    // password) provider, where it's simply null — not present in the
    // CLI's generated output for this version, discovered from the
    // runtime error it throws without it.
    issuer: text("issuer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// ---------------------------------------------------------------------------
// HUMANORA application tables
// ---------------------------------------------------------------------------

export const planEnum = ["free", "essential", "pro", "ultra"] as const;
export type Plan = (typeof planEnum)[number];

/**
 * One row per user per billing period (calendar month, for now — no
 * billing exists yet, so "period" just means "the current month").
 * This is the single source of truth for server-side quota enforcement;
 * the client never gets to report its own usage.
 */
export const usagePeriod = pgTable(
  "usage_period",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    plan: text("plan", { enum: planEnum }).notNull().default("free"),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    humanizeCount: integer("humanize_count").notNull().default(0),
    wordsProcessed: integer("words_processed").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("usage_period_user_idx").on(table.userId, table.periodStart)]
);

/**
 * A saved humanization. Only ever queried/mutated scoped to the owning
 * userId — see lib/db/history.ts for the ownership-checked accessors.
 */
export const humanization = pgTable(
  "humanization",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    mode: text("mode").notNull(),
    strength: text("strength").notNull(),
    inputText: text("input_text").notNull(),
    outputText: text("output_text").notNull(),
    wordCount: integer("word_count").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("humanization_user_idx").on(table.userId, table.createdAt)]
);

/**
 * My Voice — Phase 2 scope is deliberately limited to "does a profile
 * exist and how complete is it", not real style analysis. `completeness`
 * is a simple function of sample count for now (see lib/db/voice.ts);
 * replacing it with genuine writing-style analysis is Phase 3 work and
 * this table's shape doesn't need to change for that.
 */
export const voiceProfile = pgTable("voice_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }).unique(),
  sampleCount: integer("sample_count").notNull().default(0),
  totalWordsSubmitted: integer("total_words_submitted").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
