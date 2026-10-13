import type { Article, SourceInfo } from '../types/news';
import { detectCategory, extractHashtags } from './categorizer';

const HN_SOURCE: SourceInfo = {
  id: 'hackernews',
  name: 'Hacker News',
  shortName: 'HN',
  domain: 'news.ycombinator.com',
  badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  textColor: 'text-orange-400',
  borderColor: 'border-orange-500/40',
  type: 'community',
};

interface HnItem {
  id: number;
  title?: string;
  url?: string;
  by?: string;
  score?: number;
  time?: number;
  text?: string;
  descendants?: number;
  type?: string;
}

export async function fetchHackerNews(limit: number = 25): Promise<Article[]> {
  const topStoriesRes = await fetch(
    'https://hacker-news.firebaseio.com/v0/topstories.json',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DevPulse/2.0; +https://devpulse.dev)',
      },
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!topStoriesRes.ok) {
    throw new Error(`Error HTTP al obtener Hacker News: ${topStoriesRes.status}`);
  }

  const ids: number[] = await topStoriesRes.json();
  const selectedIds = ids.slice(0, limit);

  const fetchItemPromises = selectedIds.map(async (id) => {
    try {
      const itemRes = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DevPulse/2.0; +https://devpulse.dev)',
          },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (!itemRes.ok) return null;
      return (await itemRes.json()) as HnItem;
    } catch {
      return null;
    }
  });

  const results = await Promise.allSettled(fetchItemPromises);
  const articles: Article[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value && result.value.title) {
      const item = result.value;
      const title = (item.title || 'Sin título').trim();
      const hnComments = item.descendants || 0;
      const hnScore = item.score || 0;

      // Clean snippet or generate one with HN metrics
      let snippet = '';
      if (item.text) {
        snippet = item.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      if (!snippet) {
        snippet = `Discusión en la comunidad Hacker News: ${hnScore} puntos y ${hnComments} comentarios activos. Publicado por ${item.by || 'autor'}.`;
      } else if (snippet.length > 240) {
        snippet = `${snippet.substring(0, 237).trim()}...`;
      }

      const link = item.url || `https://news.ycombinator.com/item?id=${item.id}`;
      const pubDate = item.time
        ? new Date(item.time * 1000).toISOString()
        : new Date().toISOString();

      const category = detectCategory(title, snippet);
      const hashtags = extractHashtags(title, snippet, [], 'hackernews', category);

      articles.push({
        id: `hn-${item.id}`,
        title,
        link,
        pubDate,
        snippet,
        source: HN_SOURCE,
        category,
        author: item.by,
        hnScore,
        hnComments,
        hashtags,
        mediaType: 'discussion',
      });
    }
  }

  return articles;
}
