import { redirect, notFound } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { getProjectWithItems } from "@/lib/db/projects";
import { ProjectDetail } from "@/components/dashboard/ProjectDetail";

export const metadata = { title: "Project — HUMANORA" };

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");

  const { id } = await params;
  const data = await getProjectWithItems(result.session.user.id, id);
  if (!data) notFound();

  return (
    <Container className="mx-auto max-w-3xl">
      <ProjectDetail
        id={data.project.id}
        name={data.project.name}
        description={data.project.description}
        createdAt={data.project.createdAt.toISOString()}
        items={data.items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))}
      />
    </Container>
  );
}
