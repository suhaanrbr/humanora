# Phase 2 setup — what I need from you

Everything that can be built without your credentials is done: database
schema, auth integration, protected routes, signup/login pages, dashboard,
quota enforcement. The app still builds and the public site/demo still
work with none of this connected. Two things now require an account only
you can create.

---

## 1. Create a free Neon Postgres database

1. Go to **https://neon.tech** and sign up (GitHub or email — no card).
2. On the "Create your first project" screen:
   - Project name: `humanora` (or anything)
   - Postgres version: leave default
   - Region: pick whichever is closest to you
3. **Do NOT** click anything mentioning "Scale plan," "Launch plan," or
   "upgrade" — stay on the plan you land on by default (Free).
4. Once the project is created, go to the **Dashboard → Connection
   Details** panel.
5. Make sure the toggle/dropdown says **"Pooled connection"** (not
   "Direct connection") — copy that connection string. It looks like:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
6. **Verify no payment method exists:** go to **Billing** in the Neon
   dashboard sidebar — it should show "Free plan," no card on file, no
   option that's already active other than Free. If it ever asks you to
   add a card to continue, stop and tell me — that would mean something
   changed since I last checked their terms.

**Send me that connection string** (paste it here, or put it directly
into `frontend/.env.local` yourself as `DATABASE_URL=...` and just tell
me it's done — either is fine, same as the Gemini key).

## 2. Generate an auth secret (no account needed — you do this locally)

Run this yourself in a terminal:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Put the output in `frontend/.env.local` as:
```
BETTER_AUTH_SECRET=<paste the output here>
BETTER_AUTH_URL=http://localhost:3100
```

## Never paste into chat

- Nothing extra here, actually — the Neon connection string does contain
  a password, so treat it the same way you treated the Gemini key
  (fine to paste to me once, just don't post it anywhere public).

## Once I have `DATABASE_URL`

I'll run the migration (`drizzle-kit push`) to create the tables in your
new Neon database, then test the complete signup → login → dashboard →
humanize → history → logout flow for real, including confirming one
account can never see another account's history.
