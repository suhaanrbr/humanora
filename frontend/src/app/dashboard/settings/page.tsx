import { redirect } from "next/navigation";

/**
 * Settings has been folded into Profile's own Account tab — see
 * /dashboard/profile (ProfileWorkspace.tsx's `AccountTab`, which
 * reuses the exact same `ProfileForm`/`DangerZone` components this
 * page used to render directly). Kept as a redirect rather than
 * removed outright so existing bookmarks/links to `/dashboard/settings`
 * still land somewhere real.
 */
export default function SettingsRedirect() {
  redirect("/dashboard/profile?tab=account");
}
