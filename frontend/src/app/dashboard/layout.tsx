import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

/**
 * The real authorization boundary for /dashboard/*. middleware.ts already
 * redirects unauthenticated requests based on cookie presence alone (fast,
 * but not proof of a valid session) — this layout independently verifies
 * the session server-side via Better Auth before rendering anything, so
 * an expired/forged/revoked cookie can never reach real user data.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    const { auth } = await import("@/lib/auth");
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    // Database unavailable — fail closed (redirect), not open.
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Header />
      <main className="flex-1 py-12 sm:py-16">{children}</main>
      <Footer />
    </>
  );
}
