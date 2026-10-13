export type CategoryName =
  | 'IA & ML'
  | 'Telecomunicaciones'
  | 'Software & Dev'
  | 'General Tech';

export type CategoryFilterId =
  | 'all'
  | 'ia-ml'
  | 'telecom'
  | 'software-dev'
  | 'general-tech'
  | 'saved';

export type SourceFilterId =
  | 'all'
  | 'midudev'
  | 'github'
  | 'webdev'
  | 'vercel'
  | 'mozilla'
  | 'cisco'
  | 'att-mexico'
  | 'att'
  | 'huawei'
  | 'huggingface'
  | 'devto'
  | 'hackernews'
  | 'techcrunch'
  | 'nyt'
  | 'medium';

export type SourceType = 'creator' | 'official-dev' | 'community' | 'media' | 'telecom';

export interface SourceInfo {
  id: string;
  name: string;
  shortName: string;
  domain: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  type?: SourceType;
  avatarUrl?: string;
  verified?: boolean;
}

export interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: string; // ISO 8601 string
  snippet: string;
  source: SourceInfo;
  category: CategoryName;
  author?: string;
  imageUrl?: string;
  hnScore?: number;
  hnComments?: number;
  hashtags?: string[];
  isSpecial?: boolean;
  mediaType?: 'video' | 'article' | 'discussion';
}

export interface SourceStatus {
  sourceId: string;
  name: string;
  status: 'ok' | 'error';
  itemCount: number;
  error?: string;
  type?: SourceType;
}

export interface TrendingHashtag {
  tag: string;
  count: number;
}

export interface NewsApiResponse {
  success: boolean;
  articles: Article[];
  total: number;
  fetchedAt: string;
  sourcesStatus: SourceStatus[];
  trendingHashtags: TrendingHashtag[];
  error?: string;
}
