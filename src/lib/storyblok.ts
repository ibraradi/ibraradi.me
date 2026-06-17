import { useStoryblokApi } from '@storyblok/astro';

export type BlogPost = {
  slug: string; // e.g. "intercepting-firestore"
  fullSlug: string; // e.g. "blog/intercepting-firestore"
  title: string;
  date: string; // ISO-ish string
  excerpt: string;
  tags: string[];
  content: string; // markdown
};

// Draft while developing so unpublished posts are visible locally;
// only published posts ship in the production build.
const version: 'draft' | 'published' = import.meta.env.DEV ? 'draft' : 'published';

function mapStory(story: any): BlogPost {
  const c = story?.content ?? {};
  const tags =
    typeof c.tags === 'string'
      ? c.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : Array.isArray(c.tags)
        ? c.tags
        : [];
  return {
    slug: story.slug,
    fullSlug: story.full_slug,
    title: c.title || story.name,
    date: c.date || story.first_published_at || story.created_at || '',
    excerpt: c.excerpt || '',
    tags,
    content: c.content || '',
  };
}

/** All blog posts, newest first. Returns [] if Storyblok isn't configured. */
export async function getPosts(): Promise<BlogPost[]> {
  if (!import.meta.env.STORYBLOK_TOKEN) return [];
  try {
    const api = useStoryblokApi();
    const { data } = await api.get('cdn/stories', {
      version,
      starts_with: 'blog/',
      content_type: 'post',
      per_page: 100,
      sort_by: 'content.date:desc',
    });
    return (data?.stories ?? []).map(mapStory);
  } catch {
    return [];
  }
}

/** A single post by its short slug, or null if missing. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  if (!import.meta.env.STORYBLOK_TOKEN) return null;
  try {
    const api = useStoryblokApi();
    const { data } = await api.get(`cdn/stories/blog/${slug}`, { version });
    return data?.story ? mapStory(data.story) : null;
  } catch {
    return null;
  }
}
