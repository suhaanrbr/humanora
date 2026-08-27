# HUMANORA — AI Cost Model & Plan Economics

This document derives the per-plan limits in `lib/config/plans.ts` from
real Gemini pricing and HUMANORA's actual prompt/request behavior. It
exists so those numbers can be revisited later without re-deriving them
from scratch, and so nobody mistakes them for arbitrary round numbers.

**Written:** 2026-08-27. Gemini pricing and the ₹→$ rate below are a
snapshot as of that date — re-check both before trusting this model more
than ~6 months out, and definitely before 2027-01-01 (see the pricing
change noted below).

## Inputs (grounded, not guessed)

- **Model:** `gemini-3.6-flash` (`lib/ai/humanize.ts`)
- **Gemini pricing** (current, introductory, through 2026-12-31):
  **$0.75 / 1M input tokens, $3.75 / 1M output tokens.** Standard pricing
  from 2027-01-01 doubles to $1.50 / $7.50 — this model does **not**
  currently account for that increase; revisit plan limits before then.
  Sources: Google's own Gemini API pricing page and multiple third-party
  aggregators (chatbase.co, OpenRouter, Requesty) agreeing on the same
  figures as of this writing.
- **Exchange rate used:** ₹95.4 / $1 (mid-market, as of this writing) —
  a real-world rate is used deliberately rather than an optimistic round
  number, since a *weaker* rupee makes the dollar-denominated Gemini
  cost look *larger* in rupees, which is the conservative direction for
  a margin estimate.
- **Token/word approximations** (standard rough conversions, not an
  exact tokenizer count — Gemini doesn't publish one for arbitrary
  English text): **~4 characters/token**, **~6 characters/word**
  (HUMANORA's own existing plan config already assumes 6 chars/word for
  its "words per request" marketing copy, so this stays consistent with
  numbers already shown to customers).
- **Prompt overhead:** the fixed instruction/rules text in
  `buildPrompt()` (`lib/ai/humanize.ts`) plus worst-case optional
  additions (a My Voice style-directive line, a 300-character custom
  instruction, the "vary this" line on candidates after the first) comes
  to roughly **400 tokens** per call, worst case.
- **Calls per Humanize action:** exactly `PLANS[plan].outputVariations`
  — each variation is a **separate, full** Gemini request (Gemini
  3.6-flash rejects `candidateCount > 1`), re-sending the complete
  prompt (overhead + original text) every time. This means
  `outputVariations` is a direct cost multiplier on every other number
  below, not a free bonus.
- **Output ceiling:** previously a flat `maxOutputTokens: 1024`
  regardless of plan or input length. This was actually **two separate
  problems**, not one:
  1. For Pro/Ultra's longest permitted inputs (3,000–5,000 words ≈
     4,500–7,500 tokens), a competent same-length rewrite can
     legitimately need well over 1,024 output tokens — meaning the
     *existing* code could silently **truncate** a long rewrite before
     this change, independent of any cost question.
  2. For Free/Essential's shortest inputs, 1,024 tokens (~750 words) of
     *possible* output was far more than any real rewrite needs, so it
     was pure unclaimed cost exposure.

  Fixed by scaling the actual per-call `maxOutputTokens` to the request's
  input length (`lib/ai/humanize.ts`), capped by a new
  `PLANS[plan].outputTokenLimit` sized per plan to comfortably cover
  that plan's longest permitted input without truncating it.

## The missing control: a real monthly word allowance

Before this pass, the only two real spend controls were
`monthlyHumanizations` (a request *count*) and `maxInputChars` (a
per-request length cap). Nothing bounded **total monthly volume** —
`wordsProcessed` was tracked in the database (`lib/db/usage.ts`) but
never checked against anything. A paying account could legally submit
its plan's absolute maximum-length text on *every single one* of its
monthly humanizations, multiplied again by `outputVariations` re-sends.
At Ultra's old numbers (2,000/mo × 5,000 words × 5 variations) that
worst case alone was many multiples of the ₹999 price — a genuine,
previously-unbounded liability, not a hypothetical one.

`monthlyWordAllowance` (new field, `lib/config/plans.ts`) closes this:
it's checked atomically alongside `monthlyHumanizations` in the same
`UPDATE ... WHERE` reservation (`checkAndReserveQuota`,
`lib/db/usage.ts`) **before** every Gemini call, using the same
concurrency-safe pattern already used for the humanization-count check
and the free-trial reservation — a race between two concurrent requests
can't push either counter over its limit, because Postgres serializes
the conditional `UPDATE`s.

## Cost model

For a plan with `H` = monthlyHumanizations, `V` = outputVariations,
`A` = monthlyWordAllowance (total input words across the month, the
realistic budget-relevant figure — not the rare single max-length
request):

```
overhead_cost  = H × V × 400 tokens × $0.75 / 1e6
input_cost     = A × V × 1.5 tokens/word × $0.75 / 1e6      (1.5 = 6 chars/word ÷ 4 chars/token)
output_cost    = A × V × 1.3 tokens/word × $3.75 / 1e6      (assumes typical output ≈ 1.3× input length —
                                                              a deliberately generous assumption; most
                                                              rewrites are not meaningfully longer than
                                                              the original)
total ≈ H×V×$0.0003 + A×V×$0.000006
```

This intentionally does **not** assume every request hits
`maxInputChars` — that scenario is bounded separately by
`outputTokenLimit` (a hard per-call ceiling) and remains rare in
practice, bounded in aggregate by `A` regardless of how it's split
across requests.

## Resulting plan table

| Plan | Price | Max words/request | Monthly word allowance | Monthly humanizations | Variations | Output token ceiling | Modeled Gemini cost/mo | AI % of revenue |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Free | ₹0 | ~35 | 35 (one-time, not monthly) | 1 (lifetime) | 1 | 256 | ~$0.0013 (~₹0.12) one-time | n/a (acquisition cost) |
| Essential | ₹399 | 1,500 | 25,000 | 100 | 2 | 3,072 | ~$0.36 (~₹34) | ~8.6% |
| Pro | ₹599 | 3,000 | 45,000 | 150 | 2 | 6,144 | ~$0.63 (~₹60) | ~10.0% |
| Ultra | ₹999 | 5,000 | 55,000 | 180 | 3 | 10,240 | ~$1.15 (~₹110) | ~11.0% |

All four land inside the requested 10–15% target band except Free
(a one-time, near-zero acquisition cost, not a recurring monthly one)
and Essential, which comes in intentionally *under* the band (~8.6%) as
margin buffer for the least-scrutinized, highest-volume-of-accounts
tier.

Rate limiting (existing, unchanged): 20 requests/minute/user
(`BURST_LIMIT` in `app/api/humanize/route.ts`) — independent of the
monthly caps above, this stops one account from hammering the endpoint
faster than a human could plausibly review results, regardless of how
much quota remains.

Concurrency: both the free-trial reservation and the paid-plan
`checkAndReserveQuota` reserve their unit(s) with a single conditional
`UPDATE` **before** calling Gemini, and release it on any failure — the
existing, already-correct pattern this change extends rather than
replaces.

## What this does NOT account for

- **Razorpay fees** (~2% + tax on each payment) — not included in the
  "AI % of revenue" figures above, which are Gemini-only. Layering
  Razorpay's fee on top still leaves meaningful gross margin at every
  paid tier given the Gemini percentages above.
- **Database/hosting variable cost** — Neon Postgres and Vercel's
  current tiers are effectively fixed/near-zero at HUMANORA's present
  scale; not modeled per-request here.
- **The 2027-01-01 Gemini price increase** (see above) — at that point
  this entire table's cost column roughly doubles, pushing every plan
  above the 10–15% target band. This should be re-derived before then,
  not assumed away.
- **Actual tokenization** — 4 chars/token and 6 chars/word are standard
  approximations for English prose, not Gemini's real tokenizer output
  for HUMANORA's specific prompts. Real usage will vary in both
  directions; the ~9-11% landing point (vs. the 10-15% ceiling) is
  deliberately not cut razor-thin against that uncertainty.
