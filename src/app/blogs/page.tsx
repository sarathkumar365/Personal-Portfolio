import { getBlogPosts } from "@/data/blogs";
import BlogsClient from "./blogs-client";

export default async function BlogsPage() {
  const posts = await getBlogPosts();

  return <BlogsClient posts={posts} />;
}
