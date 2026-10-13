import { useState, useEffect, useCallback } from 'react';
import type { Article } from '../types/news';

const STORAGE_KEY = 'tech_news_hub_bookmarks_v1';
const EVENT_KEY = 'tech_news_bookmarks_updated';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load bookmarks from LocalStorage on mount
  const loadBookmarks = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Article[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      } else {
        setBookmarks([]);
      }
    } catch (e) {
      console.error('Error reading bookmarks from LocalStorage:', e);
      setBookmarks([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();

    // Listen to changes from other tabs and within same window
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        loadBookmarks();
      }
    };

    const handleCustomEvent = () => {
      loadBookmarks();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(EVENT_KEY, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(EVENT_KEY, handleCustomEvent);
    };
  }, [loadBookmarks]);

  const saveBookmarks = useCallback((next: Article[]) => {
    setBookmarks(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(EVENT_KEY));
      } catch (e) {
        console.error('Error saving bookmarks to LocalStorage:', e);
      }
    }
  }, []);

  const isBookmarked = useCallback(
    (id: string) => {
      return bookmarks.some((item) => item.id === id);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (article: Article) => {
      setBookmarks((prev) => {
        const exists = prev.some((item) => item.id === article.id);
        const next = exists
          ? prev.filter((item) => item.id !== article.id)
          : [article, ...prev];

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            window.dispatchEvent(new Event(EVENT_KEY));
          } catch (e) {
            console.error('Error saving bookmark to LocalStorage:', e);
          }
        }
        return next;
      });
    },
    []
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event(EVENT_KEY));
        } catch (e) {
          console.error('Error removing bookmark from LocalStorage:', e);
        }
      }
      return next;
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    saveBookmarks([]);
  }, [saveBookmarks]);

  return {
    bookmarks,
    isInitialized,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearBookmarks,
    bookmarkCount: bookmarks.length,
  };
}
