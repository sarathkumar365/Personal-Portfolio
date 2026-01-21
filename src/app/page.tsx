import HomePage from "@/components/home-page";
import { getHomeData } from "@/data/portfolio";

export default function Home() {
  const data = getHomeData();

  return <HomePage data={data} />;
}
