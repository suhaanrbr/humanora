"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth-client";

export function AccountSettings({ name: initialName, email }: { name: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function saveName() {
    if (!name.trim() || name === initialName) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Couldn't update your name.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Couldn't reach HUMANORA. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <p className="mb-4 text-sm font-medium text-foreground">Profile</p>
        <label className="mb-1.5 block text-xs text-foreground-subtle">Name</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          maxLength={80}
          className="focus-ring w-full rounded-md border border-border bg-background-elevated px-3.5 py-2.5 text-sm text-foreground"
        />
        <label className="mb-1.5 mt-4 block text-xs text-foreground-subtle">Email</label>
        <input
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-md border border-border bg-background-elevated px-3.5 py-2.5 text-sm text-foreground-subtle"
        />
        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
        <div className="mt-4 flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={saveName} loading={saving} disabled={!name.trim() || name === initialName}>
            Save changes
          </Button>
          {saved && <span className="text-xs text-success">Saved</span>}
        </div>
      </Card>

      <DangerZone />
    </div>
  );
}

function DangerZone() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Couldn't delete your account. Please try again.");
        setDeleting(false);
        return;
      }
      await signOut();
      router.push("/");
      router.refresh();
    } catch {
      setError("Couldn't reach HUMANORA. Check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <Card className="border-danger/30 bg-danger/5 p-6">
      <p className="text-sm font-medium text-foreground">Delete account</p>
      <p className="mt-1 text-xs text-foreground-muted">
        This permanently deletes your account, history, My Voice samples, and billing records. This
        cannot be undone.
      </p>

      {!confirming ? (
        <Button variant="destructive" size="sm" className="mt-4" onClick={() => setConfirming(true)}>
          Delete my account
        </Button>
      ) : (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-foreground-subtle">
            Type <span className="font-mono font-semibold">DELETE</span> to confirm
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="focus-ring w-full max-w-xs rounded-md border border-danger/40 bg-background-elevated px-3.5 py-2.5 text-sm text-foreground"
          />
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
              disabled={confirmText !== "DELETE"}
            >
              Permanently delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setConfirming(false); setConfirmText(""); setError(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
