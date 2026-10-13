import Parser from 'rss-parser';
import type { Article, CategoryName, SourceInfo } from '../types/news';
import { detectCategory, extractHashtags } from './categorizer';
import { fetchMidudevArticles } from './midudevFetcher';

// Custom fields to capture media, youtube metadata, and creators
const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 DevPulse/2.0',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
  },
  timeout: 9000,
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

function cleanSnippet(rawText: string): string {
  if (!rawText) return '';

  return (
    rawText
      // Remove html tags
      .replace(/<[^>]*>/g, ' ')
      // Remove medium standard boilerplate
      .replace(/Continue reading on Medium »/gi, '')
      // Decode common HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x2014;/g, '—')
      .replace(/&#x2013;/g, '–')
      .replace(/&nbsp;/g, ' ')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function extractImageUrl(item: any): string | undefined {
  // Check YouTube mediaGroup thumbnail
  if (
    item.mediaGroup &&
    Array.isArray(item.mediaGroup['media:thumbnail']) &&
    item.mediaGroup['media:thumbnail'][0]?.$?.url
  ) {
    return item.mediaGroup['media:thumbnail'][0].$.url;
  }
  // Check media:content
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  // Check media:thumbnail
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }
  // Check enclosure
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  // Check HTML in content or content:encoded for img tag
  const content = item['content:encoded'] || item.content || item.description || '';
  const match = content.match(/<img[^>]+src=["'](https?:\/\/[^"'>]+)["']/i);
  if (match && match[1]) {
    return match[1];
  }
  return undefined;
}

function extractTags(item: any): string[] {
  if (!item.categories || !Array.isArray(item.categories)) return [];
  return item.categories
    .map((cat: any) => {
      if (typeof cat === 'string') return cat;
      if (cat && typeof cat === 'object') {
        return cat._ || cat.name || cat.$?.term || '';
      }
      return '';
    })
    .filter(Boolean);
}

export interface RssFeedConfig {
  sourceId: string;
  source: SourceInfo;
  url: string;
  forcedCategory?: CategoryName;
  mediaType?: 'video' | 'article' | 'discussion';
  isSpecial?: boolean;
}

export const RSS_FEEDS: RssFeedConfig[] = [
  // 1. Featured Creator: midudev
  {
    sourceId: 'midudev',
    source: {
      id: 'midudev',
      name: 'midudev',
      shortName: 'midu',
      domain: 'midu.dev',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-400/40',
      type: 'creator',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1561955?v=4',
      verified: true,
    },
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8LeXCWOalN8SxlrPcG-PaQ',
    mediaType: 'video',
    forcedCategory: 'Software & Dev',
    isSpecial: true,
  },

  // 2. Official Developer Blogs
  {
    sourceId: 'github',
    source: {
      id: 'github',
      name: 'GitHub Blog',
      shortName: 'GitHub',
      domain: 'github.blog',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      textColor: 'text-purple-300',
      borderColor: 'border-purple-500/40',
      type: 'official-dev',
      verified: true,
    },
    url: 'https://github.blog/feed/',
    forcedCategory: 'Software & Dev',
  },
  {
    sourceId: 'webdev',
    source: {
      id: 'webdev',
      name: 'web.dev (Google)',
      shortName: 'web.dev',
      domain: 'web.dev',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-500/40',
      type: 'official-dev',
      verified: true,
    },
    url: 'https://web.dev/static/blog/feed.xml',
    forcedCategory: 'Software & Dev',
  },
  {
    sourceId: 'vercel',
    source: {
      id: 'vercel',
      name: 'Vercel News',
      shortName: 'Vercel',
      domain: 'vercel.com',
      badgeColor: 'bg-slate-200/15 text-slate-100 border-slate-300/30',
      textColor: 'text-slate-100',
      borderColor: 'border-slate-300/40',
      type: 'official-dev',
      verified: true,
    },
    url: 'https://vercel.com/atom',
    forcedCategory: 'Software & Dev',
  },
  {
    sourceId: 'mozilla',
    source: {
      id: 'mozilla',
      name: 'Mozilla Hacks',
      shortName: 'Mozilla',
      domain: 'hacks.mozilla.org',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      textColor: 'text-rose-300',
      borderColor: 'border-rose-500/40',
      type: 'official-dev',
      verified: true,
    },
    url: 'https://hacks.mozilla.org/feed/',
    forcedCategory: 'Software & Dev',
  },

  // 3. Developer Community
  {
    sourceId: 'devto',
    source: {
      id: 'devto',
      name: 'DEV Community',
      shortName: 'DEV',
      domain: 'dev.to',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      textColor: 'text-indigo-300',
      borderColor: 'border-indigo-500/40',
      type: 'community',
    },
    url: 'https://dev.to/feed',
    forcedCategory: 'Software & Dev',
  },

  // 4. Technology Media & Journals
  {
    sourceId: 'techcrunch',
    source: {
      id: 'techcrunch',
      name: 'TechCrunch',
      shortName: 'TC',
      domain: 'techcrunch.com',
      badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      textColor: 'text-teal-300',
      borderColor: 'border-teal-500/40',
      type: 'media',
    },
    url: 'https://techcrunch.com/feed/',
  },
  {
    sourceId: 'medium',
    source: {
      id: 'medium',
      name: 'Medium',
      shortName: 'Medium',
      domain: 'medium.com',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-400/40',
      type: 'media',
      avatarUrl: 'https://miro.medium.com/v2/1*TGH72Nnw24QL3iV9IOm4VA.png',
      verified: true,
    },
    url: 'https://medium.com/feed/tag/technology',
  },
  {
    sourceId: 'nyt',
    source: {
      id: 'nyt',
      name: 'The New York Times',
      shortName: 'NYT',
      domain: 'nytimes.com',
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      textColor: 'text-sky-300',
      borderColor: 'border-sky-500/40',
      type: 'media',
    },
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  },
  {
    sourceId: 'huggingface',
    source: {
      id: 'huggingface',
      name: 'Hugging Face',
      shortName: 'HF',
      domain: 'huggingface.co',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-500/40',
      type: 'community',
    },
    url: 'https://huggingface.co/blog/feed.xml',
    forcedCategory: 'IA & ML',
  },

  // 5. Telecomunicaciones, Redes & Conectividad Oficial
  {
    sourceId: 'cisco',
    source: {
      id: 'cisco',
      name: 'Cisco',
      shortName: 'Cisco',
      domain: 'cisco.com',
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
      textColor: 'text-sky-300',
      borderColor: 'border-sky-400/40',
      type: 'telecom',
      avatarUrl: 'https://blogs.cisco.com/gcs/ciscoblogs/1/2024/09/cropped-Cisco-logo-thumb-sky-blue-150x150.jpg',
      verified: true,
    },
    url: 'https://blogs.cisco.com/feed',
    forcedCategory: 'Telecomunicaciones',
  },
  {
    sourceId: 'att-mexico',
    source: {
      id: 'att-mexico',
      name: 'AT&T México',
      shortName: 'AT&T MX',
      domain: 'att.com.mx',
      badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-400/40',
      type: 'telecom',
    },
    url: 'https://news.google.com/rss/search?q=AT%26T+Mexico&hl=es-419&gl=MX&ceid=MX:es-419',
    forcedCategory: 'Telecomunicaciones',
  },
  {
    sourceId: 'att',
    source: {
      id: 'att',
      name: 'AT&T',
      shortName: 'AT&T',
      domain: 'att.com',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
      textColor: 'text-cyan-300',
      borderColor: 'border-cyan-400/40',
      type: 'telecom',
    },
    url: 'https://news.google.com/rss/search?q=AT%26T+telecom&hl=en-US&gl=US&ceid=US:en',
    forcedCategory: 'Telecomunicaciones',
  },
  {
    sourceId: 'huawei',
    source: {
      id: 'huawei',
      name: 'Huawei',
      shortName: 'Huawei',
      domain: 'huawei.com',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      textColor: 'text-rose-300',
      borderColor: 'border-rose-500/40',
      type: 'telecom',
    },
    url: 'https://news.google.com/rss/search?q=Huawei+telecom+OR+Huawei+5G+OR+HarmonyOS&hl=es-419&gl=MX&ceid=MX:es-419',
    forcedCategory: 'Telecomunicaciones',
  },
];

export async function fetchRssFeed(config: RssFeedConfig): Promise<Article[]> {
  if (config.sourceId === 'midudev') {
    return await fetchMidudevArticles(config.source);
  }

  let items: any[] = [];

  if (config.sourceId === 'cisco') {
    const urls = [
      config.url,
      'https://news.google.com/rss/search?q=Cisco+telecom+OR+Cisco+redes+OR+Cisco+Systems&hl=es-419&gl=MX&ceid=MX:es-419',
    ];
    const feeds = await Promise.allSettled(urls.map((u) => parser.parseURL(u)));
    for (const res of feeds) {
      if (res.status === 'fulfilled' && Array.isArray(res.value.items)) {
        items.push(...res.value.items);
      }
    }
  } else {
    const feed = await parser.parseURL(config.url);
    if (feed.items && Array.isArray(feed.items)) {
      items = feed.items;
    }
  }

  if (items.length === 0) {
    return [];
  }

  // Midudev, Cisco and major feeds: keep up to 25 items each
  const maxItems = config.sourceId === 'midudev' || config.sourceId === 'cisco' ? 25 : 15;

  return items.slice(0, maxItems).map((item, index): Article => {
    let title = (item.title || 'Sin título').trim();
    // Normalize midudev multiline titles if needed
    if (config.sourceId === 'midudev') {
      title = title.replace(/\n+/g, ' ').trim();
    }

    let author: string | undefined =
      config.sourceId === 'midudev'
        ? 'midudev'
        : item.creator || item['dc:creator'] || undefined;

    // For feeds with "Title - SourceName" like Google News (AT&T, Huawei, etc.)
    if (!author && title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length > 1 && (parts[parts.length - 1]?.length || 0) < 40) {
        author = parts.pop()?.trim();
        title = parts.join(' - ').trim();
      }
    }

    let rawSnippet = '';
    if (
      item.mediaGroup &&
      Array.isArray(item.mediaGroup['media:description']) &&
      item.mediaGroup['media:description'][0]
    ) {
      rawSnippet = item.mediaGroup['media:description'][0];
    } else {
      rawSnippet =
        item.contentSnippet ||
        item.summary ||
        item.content ||
        item['content:encoded'] ||
        '';
    }

    const clean = cleanSnippet(rawSnippet);
    const snippet =
      clean.length > 240 ? `${clean.substring(0, 237).trim()}...` : clean;

    const rawTags = extractTags(item);
    const category = detectCategory(
      title,
      clean,
      rawTags,
      config.forcedCategory
    );

    const hashtags = extractHashtags(
      title,
      rawSnippet,
      rawTags,
      config.sourceId,
      category
    );

    const pubDate = item.isoDate
      ? new Date(item.isoDate).toISOString()
      : item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString();

    const imageUrl = extractImageUrl(item);
    const link = item.link || item.guid || '#';
    const id = `${config.sourceId}-${item.guid || item.link || index}-${pubDate}`;

    return {
      id,
      title,
      link,
      pubDate,
      snippet: snippet || 'Haz clic para leer el contenido original en la fuente oficial.',
      source: config.source,
      category,
      author,
      imageUrl,
      hashtags,
      isSpecial: config.isSpecial,
      mediaType: config.mediaType || 'article',
    };
  });
}
