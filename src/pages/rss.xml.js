import rss from '@astrojs/rss';
import { SITE, BLOG_ENABLED } from '../consts';
import { getPosts } from '../lib/storyblok';

export async function GET(context) {
  if (!BLOG_ENABLED) {
    return new Response('Not found', { status: 404 });
  }

  const posts = await getPosts();

  return rss({
    title: `${SITE.name} — Field Notes`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt,
      pubDate: post.date ? new Date(post.date) : new Date(),
      link: `/blog/${post.slug}/`,
    })),
  });
}
