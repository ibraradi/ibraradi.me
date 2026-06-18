// Posts are pre-rendered to HTML by scripts/prerender-blog.mjs (plain Node, where
// Shiki works) and written to src/generated/posts.json. Pages read from here.
import postsData from '../generated/posts.json';

export type BlogPost = {
  slug: string;
  fullSlug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  html: string; // pre-rendered, Shiki-highlighted
  toc: { id: string; text: string }[];
};

const posts = postsData as BlogPost[];

/** All blog posts, newest first. */
export async function getPosts(): Promise<BlogPost[]> {
  return posts;
}

/** A single post by its short slug, or null if missing. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  return posts.find((p) => p.slug === slug) ?? null;
}
