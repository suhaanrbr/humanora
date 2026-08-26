"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Client-side auth helpers (signUp, signIn, signOut, useSession) — safe
 * to import from "use client" components. Talks to /api/auth/[...all]
 * (see app/api/auth/[...all]/route.ts).
 */
export const authClient = createAuthClient();

export const { signUp, signIn, signOut, useSession } = authClient;
