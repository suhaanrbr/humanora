"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

/**
 * Single sign-out implementation, shared by every "Log out" control in
 * the app (AccountMenu's dropdown, the landing header's mobile menu).
 * Previously each place reimplemented the same
 * signOut() → push("/") → refresh() sequence independently — this is
 * the one place that logic lives now.
 */
export function useSignOut() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut(onDone?: () => void) {
    setSigningOut(true);
    await signOut();
    onDone?.();
    router.push("/");
    router.refresh();
  }

  return { signingOut, handleSignOut };
}
