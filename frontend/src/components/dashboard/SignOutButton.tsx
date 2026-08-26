"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" loading={loading} onClick={handleSignOut}>
      Log out
    </Button>
  );
}
