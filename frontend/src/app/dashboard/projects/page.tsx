import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { listProjectsForUser } from "@/lib/db/projects";
import { ProjectsWorkspace } from "@/components/dashboard/ProjectsWorkspace";

export const metadata = { title: "Projects — HUMANORA" };

export default async function ProjectsPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");

  const projects = await listProjectsForUser(result.session.user.id);

  return (
    <Container className="mx-auto max-w-4xl">
      <ProjectsWorkspace
        initialProjects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          itemCount: p.itemCount,
        }))}
      />
    </Container>
  );
}
