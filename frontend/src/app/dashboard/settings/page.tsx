import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { AccountSettings } from "@/components/dashboard/AccountSettings";

export const metadata = { title: "Settings — HUMANORA" };

export default async function SettingsPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");

  return (
    <Container className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-foreground-muted">Manage your account.</p>
      </div>
      <AccountSettings name={result.session.user.name} email={result.session.user.email} />
    </Container>
  );
}
