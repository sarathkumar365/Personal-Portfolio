import { getBlogPosts } from "@/data/portfolio";
import BlogsClient from "./blogs-client";

export default function BlogsPage() {
  const posts = getBlogPosts();

  return <BlogsClient posts={posts} />;
}
