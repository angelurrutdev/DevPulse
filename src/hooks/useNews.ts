import { useState, useMemo, useCallback } from 'react';
import type {
  Article,
  CategoryFilterId,
  CategoryName,
  NewsApiResponse,
  SourceFilterId,
  SourceStatus,
  TrendingHashtag,
} from '../types/news';

export interface UseNewsProps {
  initialData?: NewsApiResponse | null;
}

const CATEGORY_MAP: Record<Exclude<CategoryFilterId, 'all' | 'saved'>, CategoryName> = {
  'ia-ml': 'IA & ML',
  telecom: 'Telecomunicaciones',
  'software-dev': 'Software & Dev',
  'general-tech': 'General Tech',
};

export function useNews({ initialData }: UseNewsProps = {}) {
  const [articles, setArticles] = useState<Article[]>(initialData?.articles || []);
  const [sourcesStatus, setSourcesStatus] = useState<SourceStatus[]>(
    initialData?.sourcesStatus || []
  );
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>(
    initialData?.trendingHashtags || []
  );
  const [lastFetched, setLastFetched] = useState<string>(
    initialData?.fetchedAt || new Date().toISOString()
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialData?.error || null);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterId>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilterId>('all');
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchNews = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const url = `/api/news${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error en el servidor: HTTP ${res.status}`);
      }

      const data: NewsApiResponse = await res.json();
      if (!data.success && data.articles.length === 0) {
        throw new Error(data.error || 'No se pudieron recuperar noticias');
      }

      setArticles(data.articles);
      setSourcesStatus(data.sourcesStatus || []);
      setTrendingHashtags(data.trendingHashtags || []);
      setLastFetched(data.fetchedAt);
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con el agregador de noticias');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Filtered articles calculation
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Category filter (handled separately if 'saved', which is handled in UI with bookmarks)
      if (categoryFilter !== 'all' && categoryFilter !== 'saved') {
        const targetCategory = CATEGORY_MAP[categoryFilter];
        if (article.category !== targetCategory) {
          return false;
        }
      }

      // Source filter
      if (sourceFilter !== 'all') {
        if (article.source.id !== sourceFilter) {
          return false;
        }
      }

      // Hashtag filter
      if (hashtagFilter) {
        const tagNorm = hashtagFilter.toLowerCase();
        const hasTag = article.hashtags?.some(
          (t) => t.toLowerCase() === tagNorm || t.toLowerCase().includes(tagNorm.replace('#', ''))
        );
        const tagKeyword = tagNorm.replace('#', '');
        const inText =
          article.title.toLowerCase().includes(tagKeyword) ||
          article.snippet.toLowerCase().includes(tagKeyword);

        if (!hasTag && !inText) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = article.title.toLowerCase().includes(query);
        const matchesSnippet = article.snippet.toLowerCase().includes(query);
        const matchesSource = article.source.name.toLowerCase().includes(query);
        const matchesAuthor = article.author?.toLowerCase().includes(query) || false;
        const matchesTag = article.hashtags?.some((t) => t.toLowerCase().includes(query)) || false;

        if (!matchesTitle && !matchesSnippet && !matchesSource && !matchesAuthor && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }, [articles, categoryFilter, sourceFilter, hashtagFilter, searchQuery]);

  // Compute category article counts (based on current source, hashtag & search filters)
  const categoryCounts = useMemo(() => {
    const base = articles.filter((article) => {
      if (sourceFilter !== 'all' && article.source.id !== sourceFilter) return false;
      if (hashtagFilter) {
        const tagNorm = hashtagFilter.toLowerCase();
        const hasTag = article.hashtags?.some(
          (t) => t.toLowerCase() === tagNorm || t.toLowerCase().includes(tagNorm.replace('#', ''))
        );
        const tagKeyword = tagNorm.replace('#', '');
        const inText =
          article.title.toLowerCase().includes(tagKeyword) ||
          article.snippet.toLowerCase().includes(tagKeyword);
        if (!hasTag && !inText) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesSnippet = article.snippet.toLowerCase().includes(q);
        const matchesSource = article.source.name.toLowerCase().includes(q);
        const matchesAuthor = article.author?.toLowerCase().includes(q) || false;
        const matchesTag = article.hashtags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchesTitle && !matchesSnippet && !matchesSource && !matchesAuthor && !matchesTag) {
          return false;
        }
      }
      return true;
    });

    const counts: Record<CategoryFilterId, number> = {
      all: base.length,
      'ia-ml': base.filter((a) => a.category === 'IA & ML').length,
      telecom: base.filter((a) => a.category === 'Telecomunicaciones').length,
      'software-dev': base.filter((a) => a.category === 'Software & Dev').length,
      'general-tech': base.filter((a) => a.category === 'General Tech').length,
      saved: 0, // filled by bookmark count in UI
    };

    return counts;
  }, [articles, sourceFilter, hashtagFilter, searchQuery]);

  return {
    articles,
    filteredArticles,
    sourcesStatus,
    trendingHashtags,
    lastFetched,
    isLoading,
    isRefreshing,
    error,
    categoryFilter,
    setCategoryFilter,
    sourceFilter,
    setSourceFilter,
    hashtagFilter,
    setHashtagFilter,
    searchQuery,
    setSearchQuery,
    categoryCounts,
    fetchNews,
  };
}
