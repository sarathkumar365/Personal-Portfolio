import homeJson from "../../data-source/home.json";
import projectsJson from "../../data-source/projects.json";

import type { HomeData, Project } from "./types";

const homeData: HomeData = homeJson;
const projectsData: Project[] = projectsJson;

export function getHomeData(): HomeData {
  return homeData;
}

export function getProjects(): Project[] {
  return projectsData;
}
