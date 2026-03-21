import { getProjectCurationConfig, getProjects } from "@/data/portfolio";
import ProjectsClient from "./projects-client";

export default async function ProjectsPage() {
  const [projects, config] = await Promise.all([
    getProjects({
      showHidden: process.env.NODE_ENV !== "production",
    }),
    getProjectCurationConfig(),
  ]);

  return <ProjectsClient initialProjects={projects} initialOverrides={config.overrides} />;
}
