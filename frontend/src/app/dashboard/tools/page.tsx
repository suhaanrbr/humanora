import Link from "next/link";
import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { getUserPlan } from "@/lib/db/entitlement";
import { Container } from "@/components/ui/Container";
import { TOOLS, TOOL_GROUPS } from "@/lib/config/tools";

export const metadata = { title: "Tools" };

export default async function ToolsHubPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");
  const plan = await getUserPlan(result.session.user.id);

  return (
    <Container size="wide" className="pb-16">
      <div className="mb-10 border-b border-border pb-8">
        <p className="eyebrow">Tools</p>
        <h1 className="mt-3 text-5xl leading-tight text-foreground">Everything on your desk.</h1>
        <p className="mt-3 max-w-2xl text-base text-foreground-muted">
          {plan === "free"
            ? "AI tools are included in every paid plan and share your monthly allowance. The Citation Generator is free for everyone."
            : "Every tool draws on the same monthly allowance as your rewrites. The Citation Generator doesn't use any allowance."}
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {TOOL_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="text-app-label mb-4 font-sans text-foreground-subtle">
              {group.label}
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {TOOLS.filter((t) => t.group === group.id).map((tool) => {
                const locked = plan === "free" && tool.access === "paid";
                return (
                  <li key={tool.slug}>
                    <Link
                      href={tool.appHref}
                      className="focus-ring group flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-hover"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-2xl leading-tight text-foreground">{tool.name}</span>
                        {tool.access === "free" ? (
                          <span className="eyebrow shrink-0">Free</span>
                        ) : (
                          locked && <span className="text-app-label shrink-0 text-foreground-subtle">Paid plans</span>
                        )}
                      </span>
                      <span className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-foreground-muted">{tool.summary}</span>
                      <span className="mt-4 text-sm text-foreground-subtle transition-colors group-hover:text-foreground" aria-hidden="true">
                        Open →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
