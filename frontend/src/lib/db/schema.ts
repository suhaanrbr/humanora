import { pgTable, text, timestamp, boolean, integer, index, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * HUMANORA database schema (Drizzle ORM, Postgres/Neon).
 *
 * `user`, `session`, `account`, `verification` are Better Auth's required
 * tables (shape dictated by its Drizzle adapter — do not rename columns).
 * Everything below that is HUMANORA's own data model.
 *
 * Deliberately NOT built yet (left as extension points, not tables,
 * until there's a real product need):
 *   - template, integration, activity-event, and a real AI-detector-scan
 *     table. `project` (below) shipped in the "Connected Workspace"
 *     phase — a real v1 grouping of existing content, not the fuller
 *     multi-tab "workspace" (chat context, citations, exports) that was
 *     floated in planning; those stay extension points until there's a
 *     concrete feature (Chat with Docs, etc.) that actually needs them.
 *     Templates/Integrations/AI Detector/Brand Voice still show real,
 *     minimal "in development" pages in the nav rather than fabricated
 *     data — see ComingSoon.tsx.
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
// Same three paid plans, without "free" — payment_order can only ever
// exist for something a user actually paid for.
const PAID_PLAN_ENUM = ["essential", "pro", "ultra"] as const;

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
  (table) => [
    // Unique, not just indexed — this is what makes getOrCreateCurrentPeriod's
    // onConflictDoNothing() upsert safe under concurrent requests for the
    // same user's first request of a new billing period.
    uniqueIndex("usage_period_user_period_idx").on(table.userId, table.periodStart),
  ]
);

/**
 * A Project — a named grouping of a user's existing Humanize/Study
 * output. Deliberately v1-scoped: a real, persistent grouping that
 * actually organizes real content, NOT the fuller "workspace" (chat
 * context, citations, exports) floated in planning — that's a much
 * larger, separately-justified feature; shipping a real grouping today
 * beats shipping an empty shell with more tabs.
 */
export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("project_user_idx").on(table.userId, table.createdAt)]
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
    // Nullable — most items belong to no project, same as most emails
    // belong to no folder. ON DELETE SET NULL: deleting a project must
    // never delete the humanizations/study sessions filed under it,
    // only un-file them — those rows are real user content in their own
    // right (they already exist independently in Library).
    projectId: text("project_id").references(() => project.id, { onDelete: "set null" }),
  },
  (table) => [
    index("humanization_user_idx").on(table.userId, table.createdAt),
    index("humanization_project_idx").on(table.projectId),
  ]
);

/**
 * A saved Study action (Summarize / Explain Like I'm 5 / Study Notes).
 * Mirrors `humanization` in shape and ownership pattern — Study was
 * previously stateless (nothing persisted per call); this table is what
 * makes "Study Sessions" a real, countable stat and gives Study a Recent
 * Work / Library presence instead of vanishing the moment the tab closes.
 */
export const studySessionModeEnum = ["summarize", "explain", "notes"] as const;
export type StudySessionMode = (typeof studySessionModeEnum)[number];

export const studySession = pgTable(
  "study_session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    mode: text("mode", { enum: studySessionModeEnum }).notNull(),
    inputText: text("input_text").notNull(),
    outputText: text("output_text").notNull(),
    wordCount: integer("word_count").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    projectId: text("project_id").references(() => project.id, { onDelete: "set null" }),
  },
  (table) => [
    index("study_session_user_idx").on(table.userId, table.createdAt),
    index("study_session_project_idx").on(table.projectId),
  ]
);

/**
 * My Voice — a user can own MULTIPLE named profiles (e.g. "Academic",
 * "Client Emails"), gated by plan (see lib/config/plans.ts#maxVoiceProfiles).
 * Exactly one profile per user should have isDefault=true at a time —
 * enforced in application logic (lib/db/voice.ts), not a DB constraint,
 * since "make this one the default" is a two-row transition (unset the
 * old default, set the new one) that a partial unique index can't
 * express any more simply than the application already does.
 */
export const voiceProfile = pgTable(
  "voice_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("My Voice"),
    isDefault: boolean("is_default").notNull().default(false),
    sampleCount: integer("sample_count").notNull().default(0),
    totalWordsSubmitted: integer("total_words_submitted").notNull().default(0),
    // Gemini-derived structured style profile (validated against a Zod
    // schema before being stored — see lib/ai/voiceAnalysis.ts — never
    // trust/store arbitrary model output). Null until at least one
    // analysis has run.
    styleProfileJson: text("style_profile_json"),
    // User-supplied corrections, applied on top of the inferred profile
    // when building the style prompt. User intent always wins.
    userOverridesJson: text("user_overrides_json"),
    // Hash of the exact sample set (ids + content) the current
    // styleProfileJson was analyzed from — lets us skip a redundant
    // Gemini call when the user re-opens My Voice without changing their
    // samples. See lib/ai/voiceAnalysis.ts.
    analyzedSamplesHash: text("analyzed_samples_hash"),
    analyzedAt: timestamp("analyzed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("voice_profile_user_idx").on(table.userId)]
);

/**
 * Individual pasted writing samples backing ONE Voice profile. Kept
 * separate from voiceProfile so re-analysis can reprocess all of a
 * profile's samples without losing the originals. `userId` is kept
 * (denormalized from the owning profile) purely so ownership checks
 * stay a simple single-column WHERE, matching every other
 * ownership-scoped table in this schema, rather than requiring a join
 * through voiceProfile on every sample query.
 */
export const voiceSample = pgTable(
  "voice_sample",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    profileId: text("profile_id").notNull().references(() => voiceProfile.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    wordCount: integer("word_count").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("voice_sample_user_idx").on(table.userId),
    index("voice_sample_profile_idx").on(table.profileId),
  ]
);

/**
 * One row per user — the authoritative record of whether the one
 * lifetime complimentary humanization has been used. Deliberately its
 * own table (not a column on `user`, which is Better Auth's table) and
 * deliberately NOT reset by any process — see lib/db/entitlement.ts for
 * the concurrency-safe consumption logic and why this must never be
 * touched by anything except that module.
 */
export const userEntitlement = pgTable("user_entitlement", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  freeTrialUsed: boolean("free_trial_used").notNull().default(false),
  freeTrialUsedAt: timestamp("free_trial_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptionStatusEnum = ["active", "past_due", "canceled", "expired"] as const;
export type SubscriptionStatus = (typeof subscriptionStatusEnum)[number];

/**
 * One row per user — the internal, normalized entitlement record.
 * Populated/updated ONLY from verified payment-provider webhook events
 * (see lib/payments/webhooks.ts once built) — never from client state,
 * never from a success-page redirect. Every user has a row, defaulting
 * to plan="free" — there is no "no subscription" null state to handle
 * elsewhere in the app.
 */
export const subscription = pgTable("subscription", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  plan: text("plan", { enum: planEnum }).notNull().default("free"),
  status: text("status", { enum: subscriptionStatusEnum }).notNull().default("active"),
  provider: text("provider"), // "razorpay" — null while on free plan
  providerCustomerId: text("provider_customer_id"),
  providerSubscriptionId: text("provider_subscription_id"),
  currency: text("currency"), // the currency the customer actually pays in
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Idempotency ledger for payment-provider webhooks — the provider's
 * event ID is the primary key, so a replayed/duplicated delivery can
 * never be processed twice (see section on webhook security).
 */
export const webhookEvent = pgTable("webhook_event", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});

export const paymentOrderStatusEnum = ["created", "paid", "failed"] as const;
export type PaymentOrderStatus = (typeof paymentOrderStatusEnum)[number];

/**
 * One row per Razorpay order HUMANORA creates. The Razorpay order id
 * IS the primary key — it's globally unique (Razorpay's own id space),
 * so there's no separate internal id to keep in sync, and every payment
 * verification/webhook lookup is a direct, unambiguous key lookup.
 *
 * `amountInPaise`/`planId` are captured HERE, server-side, at order
 * creation time — never re-derived from anything the client sends
 * later. Verification (see lib/payments/orders.ts) checks Razorpay's
 * own payment record against THESE stored values, not against
 * whatever the browser claims it paid.
 */
export const paymentOrder = pgTable(
  "payment_order",
  {
    id: text("id").primaryKey(), // Razorpay order id, e.g. "order_ABC123"
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    planId: text("plan_id", { enum: PAID_PLAN_ENUM }).notNull(),
    amountInPaise: integer("amount_in_paise").notNull(),
    currency: text("currency").notNull().default("INR"),
    status: text("status", { enum: paymentOrderStatusEnum }).notNull().default("created"),
    razorpayPaymentId: text("razorpay_payment_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    verifiedAt: timestamp("verified_at"),
  },
  (table) => [index("payment_order_user_idx").on(table.userId, table.createdAt)]
);
