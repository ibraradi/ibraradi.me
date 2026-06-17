import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE, BLOG_ENABLED } from '../consts';

export async function GET(context) {
  // Blog is feature-flagged off — no feed.
  if (!BLOG_ENABLED) {
    return new Response('Not found', { status: 404 });
  }

  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: `${SITE.name} — Blog`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
