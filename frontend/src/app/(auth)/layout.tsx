import { AuthShell } from "@/components/auth/AuthShell";

/**
 * Shared by /login and /signup (see the sibling page.tsx files). This
 * is what makes switching between them feel like one floating
 * interface changing state: Next.js keeps a shared layout mounted
 * across client-side navigation between routes that render it, so
 * AuthShell — the artwork, logo, badge, and headline — never remounts
 * or re-fetches when a visitor moves between the two forms. Only the
 * page-level children (the glass panel) change.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
