import type { Article, NewsApiResponse, SourceStatus, TrendingHashtag } from '../types/news';
import { fetchRssFeed, RSS_FEEDS } from './rssParser';
import { fetchHackerNews } from './hackerNews';
import { isNonTechNoise } from './categorizer';
import { fetchMidudevArticles } from './midudevFetcher';

interface CacheEntry {
  data: NewsApiResponse;
  timestamp: number;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function aggregateNews(forceRefresh = false): Promise<NewsApiResponse> {
  const now = Date.now();

  if (!forceRefresh && memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.data;
  }

  const sourcesStatus: SourceStatus[] = [];
  const allArticles: Article[] = [];

  // Prepare all feed fetch promises
  const feedPromises = RSS_FEEDS.map(async (config) => {
    try {
      const items =
        config.sourceId === 'midudev'
          ? await fetchMidudevArticles(config.source)
          : await fetchRssFeed(config);
      sourcesStatus.push({
        sourceId: config.sourceId,
        name: config.source.name,
        status: 'ok',
        itemCount: items.length,
        type: config.source.type,
      });
      return items;
    } catch (err: any) {
      sourcesStatus.push({
        sourceId: config.sourceId,
        name: config.source.name,
        status: 'error',
        itemCount: 0,
        error: err?.message || 'Error al conectar con el feed',
        type: config.source.type,
      });
      return [];
    }
  });

  const hnPromise = (async () => {
    try {
      const items = await fetchHackerNews(25);
      sourcesStatus.push({
        sourceId: 'hackernews',
        name: 'Hacker News',
        status: 'ok',
        itemCount: items.length,
        type: 'community',
      });
      return items;
    } catch (err: any) {
      sourcesStatus.push({
        sourceId: 'hackernews',
        name: 'Hacker News',
        status: 'error',
        itemCount: 0,
        error: err?.message || 'Error al consultar API de Hacker News',
        type: 'community',
      });
      return [];
    }
  })();

  const results = await Promise.all([...feedPromises, hnPromise]);

  for (const list of results) {
    allArticles.push(...list);
  }

  // Deduplicate by URL or normalized Title
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const uniqueArticles: Article[] = [];

  for (const article of allArticles) {
    if (article.source.id !== 'midudev' && isNonTechNoise(article.title, article.snippet)) {
      continue;
    }
    const normTitle = article.title.toLowerCase().trim();
    if (seenUrls.has(article.link) || seenTitles.has(normTitle)) {
      continue;
    }
    seenUrls.add(article.link);
    seenTitles.add(normTitle);
    uniqueArticles.push(article);
  }

  // Sort by pubDate descending (newest first)
  uniqueArticles.sort((a, b) => {
    const timeA = new Date(a.pubDate).getTime();
    const timeB = new Date(b.pubDate).getTime();
    return timeB - timeA;
  });

  // Calculate trending hashtags
  const tagCounts = new Map<string, number>();
  for (const article of uniqueArticles) {
    if (article.hashtags) {
      for (const tag of article.hashtags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  const trendingHashtags: TrendingHashtag[] = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      // Prioritize #midudev if present
      if (a.tag === '#midudev') return -1;
      if (b.tag === '#midudev') return 1;
      return b.count - a.count;
    })
    .slice(0, 16);

  const response: NewsApiResponse = {
    success: uniqueArticles.length > 0,
    articles: uniqueArticles,
    total: uniqueArticles.length,
    fetchedAt: new Date().toISOString(),
    sourcesStatus,
    trendingHashtags,
  };

  memoryCache = {
    data: response,
    timestamp: now,
  };

  return response;
}
