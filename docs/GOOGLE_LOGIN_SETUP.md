# Google login setup

HUMANORA's code already supports "Continue with Google" (Better Auth's
built-in Google provider, with account linking to an existing
email/password account sharing the same verified email). The button is
hidden automatically until these two environment variables are set, so
nothing breaks in the meantime.

## What you need to do (one action)

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a project for HUMANORA if you don't have one yet (top-left project selector → New Project)
3. Click **Create Credentials → OAuth client ID**
4. If prompted, configure the **OAuth consent screen** first: User type "External", app name "HUMANORA", your email as support/developer contact — no verification/scopes needed for testing with your own account
5. Application type: **Web application**
6. **Authorized JavaScript origins**: add `http://localhost:3100` (local) and your Vercel URL, e.g. `https://humanora-beryl.vercel.app`
7. **Authorized redirect URIs**: add `http://localhost:3100/api/auth/callback/google` and `https://humanora-beryl.vercel.app/api/auth/callback/google`
8. Click Create — you'll get a **Client ID** and **Client Secret**

## Where the values go

| Value | Env var | Where |
|---|---|---|
| Client ID | `GOOGLE_CLIENT_ID` | `.env.local` (local) and Vercel env vars (production) |
| Client Secret | `GOOGLE_CLIENT_SECRET` | same — paste directly into each, never into chat |

Redeploy on Vercel after adding the production values (env var changes require a redeploy to take effect).
