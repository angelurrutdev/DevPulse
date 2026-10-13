import type { Article, SourceInfo } from '../types/news';
import { detectCategory, extractHashtags } from './categorizer';
import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 DevPulse/2.0',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
  },
  timeout: 8000,
});

/**
 * Curated fallback seed data of real midudev videos.
 * Used if all live network endpoints fail or are rate-limited.
 */
const SEED_VIDEOS = [
  {
    videoId: 'IHs3rhATACU',
    title: 'Espionaje en la era de la IA',
    daysAgo: 3,
    viewsText: '54 mil vistas',
    snippet: 'Análisis de midudev sobre ciberseguridad, privacidad e inteligencia artificial en la era de los modelos autónomos.',
  },
  {
    videoId: 'A4QYEDQCnaQ',
    title: 'Crea una Landing ESPECTACULAR con Claude Code',
    daysAgo: 3,
    viewsText: '219 mil vistas',
    snippet: 'Tutorial práctico paso a paso de midudev construyendo una landing page profesional usando Claude Code y herramientas de IA.',
  },
  {
    videoId: 'ItAe6Nbjn54',
    title: 'Recortes en OpenAI, nuevo GPT 6.1 Sol y la demo que salió mal',
    daysAgo: 4,
    viewsText: '139 mil vistas',
    snippet: 'Todas las novedades del ecosistema de inteligencia artificial: OpenAI, GPT 6.1 Sol, fallos en demos en vivo y tendencias.',
  },
  {
    videoId: 'W9NkGakJzcs',
    title: 'JavaScript acaba de romper la PS5',
    daysAgo: 6,
    viewsText: '146 mil vistas',
    snippet: 'Descubren una vulnerabilidad histórica en PlayStation 5 mediante el motor de JavaScript del navegador.',
  },
  {
    videoId: 'SCUt-1YZrpo',
    title: 'Un chico de 16 años hackea Microsoft',
    daysAgo: 6,
    viewsText: '91 mil vistas',
    snippet: 'Historia y análisis técnico de la vulnerabilidad descubierta en los sistemas de Microsoft por un joven desarrollador.',
  },
  {
    videoId: 'P1SC2_uoyWM',
    title: 'JavaScript está cambiando… y nadie habla de ello',
    daysAgo: 7,
    viewsText: '58 mil vistas',
    snippet: 'Nuevas propuestas de ECMAScript, evolución del lenguaje JavaScript y el impacto de los nuevos runtimes.',
  },
  {
    videoId: 'C3vaxYtFmOo',
    title: 'El estado actual del mundo tech en 2026',
    daysAgo: 10,
    viewsText: '297 mil vistas',
    snippet: 'Radiografía completa de salarios, frameworks, IA, ofertas laborales y el futuro del desarrollo de software.',
  },
  {
    videoId: 'R0YPFW5Dv3c',
    title: 'HTML acaba de arreglar esto después de 20 años',
    daysAgo: 10,
    viewsText: '54 mil vistas',
    snippet: 'Nueva especificación web para elementos nativos de HTML sin necesidad de librerías externas de JavaScript.',
  },
  {
    videoId: '_vqk5UEi3bQ',
    title: 'Quieren controlar la IA',
    daysAgo: 12,
    viewsText: '86 mil vistas',
    snippet: 'Debate regulatorio sobre modelos de frontera, código abierto, licencias restrictivas y el futuro del open source.',
  },
  {
    videoId: 'yTPuF7whdSQ',
    title: 'No instales esto de Facebook (por ahora)',
    daysAgo: 12,
    viewsText: '79 mil vistas',
    snippet: 'Análisis de las nuevas herramientas de desarrollo de Meta y precauciones sobre telemetría y rendimiento.',
  },
  {
    videoId: 'IbJW8xIwf3E',
    title: 'GPT-6 es absurdamente barato (lo siento, Deepseek)',
    daysAgo: 13,
    viewsText: '157 mil vistas',
    snippet: 'Comparativa de costes de inferencia, tokens y velocidad entre los nuevos modelos de OpenAI y DeepSeek.',
  },
  {
    videoId: 'FrNMcmMarUQ',
    title: 'Claude Opus 5.5 es...',
    daysAgo: 13,
    viewsText: '224 mil vistas',
    snippet: 'Pruebas de razonamiento, programación y benchmarks de la versión más potente de Anthropic Claude.',
  },
  {
    videoId: 'FNxAM5qLzbg',
    title: 'La IA de Google que mejora sola',
    daysAgo: 15,
    viewsText: '158 mil vistas',
    snippet: 'Nuevos avances de Google DeepMind en auto-mejora recursiva y razonamiento formal para programadores.',
  },
  {
    videoId: 'muN6vRUsoPA',
    title: 'Abandonan React Native... ¿Por qué?',
    daysAgo: 18,
    viewsText: '252 mil vistas',
    snippet: 'Grandes empresas migran arquitecturas móviles y analizan el rendimiento real frente a alternativas nativas y web.',
  },
  {
    videoId: 'Qd8rumA6N8k',
    title: 'GPT-6 es Salvaje',
    daysAgo: 21,
    viewsText: '291 mil vistas',
    snippet: 'Primeras impresiones de las capacidades multi-agente de la nueva generación de modelos de inteligencia artificial.',
  },
];

function parseRelativeDate(text: string, fallbackOffsetDays = 0): string {
  const now = new Date();
  if (!text) {
    return new Date(now.getTime() - fallbackOffsetDays * 24 * 3600 * 1000).toISOString();
  }

  const lower = text.toLowerCase().trim();

  const mH = lower.match(/hace (\d+)\s*hora/i) || lower.match(/(\d+)\s*hour/i) || lower.match(/hace (\d+)\s*h\b/i);
  if (mH) return new Date(now.getTime() - parseInt(mH[1], 10) * 3600 * 1000).toISOString();

  const mD = lower.match(/hace (\d+)\s*d[ií]a/i) || lower.match(/(\d+)\s*day/i) || lower.match(/hace (\d+)\s*d\b/i);
  if (mD) return new Date(now.getTime() - parseInt(mD[1], 10) * 24 * 3600 * 1000).toISOString();

  const mW = lower.match(/hace (\d+)\s*semana/i) || lower.match(/(\d+)\s*week/i) || lower.match(/hace (\d+)\s*sem\b/i);
  if (mW) return new Date(now.getTime() - parseInt(mW[1], 10) * 7 * 24 * 3600 * 1000).toISOString();

  const mM = lower.match(/hace (\d+)\s*mes/i) || lower.match(/(\d+)\s*month/i) || lower.match(/hace (\d+)\s*m\b/i);
  if (mM) return new Date(now.getTime() - parseInt(mM[1], 10) * 30 * 24 * 3600 * 1000).toISOString();

  const mY = lower.match(/hace (\d+)\s*a[ñn]o/i) || lower.match(/(\d+)\s*year/i);
  if (mY) return new Date(now.getTime() - parseInt(mY[1], 10) * 365 * 24 * 3600 * 1000).toISOString();

  return new Date(now.getTime() - fallbackOffsetDays * 24 * 3600 * 1000).toISOString();
}

/**
 * Builds an Article object from midudev video data
 */
function buildMiduArticle(params: {
  videoId: string;
  title: string;
  timeText?: string;
  viewsText?: string;
  snippet?: string;
  sourceInfo: SourceInfo;
  fallbackDays?: number;
}): Article {
  const { videoId, title, timeText, viewsText, snippet, sourceInfo, fallbackDays = 0 } = params;
  const cleanTitle = title.replace(/\n+/g, ' ').trim();
  const link = `https://www.youtube.com/watch?v=${videoId}`;
  const imageUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const pubDate = parseRelativeDate(timeText || '', fallbackDays);

  const cleanSnippet =
    snippet ||
    `Video oficial de @midudev ${viewsText ? `(${viewsText})` : ''}: Novedades sobre desarrollo web, programación e inteligencia artificial.`;

  const category = detectCategory(cleanTitle, cleanSnippet, [], 'Software & Dev');
  const hashtags = extractHashtags(cleanTitle, cleanSnippet, [], 'midudev', category);

  // Guarantee #midudev is always present
  if (!hashtags.includes('#midudev')) {
    hashtags.unshift('#midudev');
  }

  return {
    id: `midudev-${videoId}`,
    title: cleanTitle,
    link,
    pubDate,
    snippet: cleanSnippet,
    source: sourceInfo,
    category,
    author: 'midudev',
    imageUrl,
    hashtags,
    isSpecial: true,
    mediaType: 'video',
  };
}

/**
 * Fetch midudev videos directly from YouTube channel videos page
 */
async function fetchFromYouTubeChannel(sourceInfo: SourceInfo): Promise<Article[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch('https://www.youtube.com/@midudev/videos', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`YouTube channel HTTP ${res.status}`);
    }

    const html = await res.text();
    const match =
      html.match(/ytInitialData\s*=\s*({.+?});<\/script>/) ||
      html.match(/var ytInitialData = ({.+?});<\/script>/);

    if (!match || !match[1]) {
      throw new Error('ytInitialData not found in HTML');
    }

    const data = JSON.parse(match[1]);
    const articles: Article[] = [];

    function walk(obj: any) {
      if (!obj || typeof obj !== 'object') return;

      // Modern YouTube lockupViewModel format
      if (
        obj.lockupViewModel &&
        obj.lockupViewModel.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO'
      ) {
        const vm = obj.lockupViewModel;
        const videoId = vm.contentId;
        const title =
          vm.metadata?.lockupMetadataViewModel?.title?.content ||
          vm.rendererContext?.accessibilityContext?.label ||
          '';

        const metaRows =
          vm.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
        let timeText = '';
        let viewsText = '';

        for (const row of metaRows) {
          for (const part of row.metadataParts || []) {
            const content = part.text?.content || '';
            const label = part.accessibilityLabel || content;
            const combined = `${content} ${label}`.toLowerCase();
            if (
              combined.includes('días') ||
              combined.includes('dia') ||
              combined.includes('hora') ||
              combined.includes('semana') ||
              combined.includes('mes') ||
              combined.includes('año') ||
              combined.includes('ago')
            ) {
              timeText = label || content;
            } else if (
              combined.includes('k') ||
              combined.includes('m') ||
              combined.includes('vistas') ||
              combined.includes('views')
            ) {
              viewsText = label || content;
            }
          }
        }

        if (videoId && title) {
          articles.push(
            buildMiduArticle({
              videoId,
              title,
              timeText,
              viewsText,
              sourceInfo,
              fallbackDays: articles.length * 2,
            })
          );
        }
        return;
      }

      // Legacy YouTube videoRenderer format fallback
      if (obj.videoRenderer && obj.videoRenderer.videoId) {
        const vr = obj.videoRenderer;
        const videoId = vr.videoId;
        const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText || '';
        const timeText = vr.publishedTimeText?.simpleText || '';
        const viewsText = vr.viewCountText?.simpleText || '';

        if (videoId && title) {
          articles.push(
            buildMiduArticle({
              videoId,
              title,
              timeText,
              viewsText,
              sourceInfo,
              fallbackDays: articles.length * 2,
            })
          );
        }
        return;
      }

      for (const key of Object.keys(obj)) {
        walk(obj[key]);
      }
    }

    walk(data);
    return articles.slice(0, 25);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch midudev articles via Google News RSS search
 */
async function fetchFromGoogleNews(sourceInfo: SourceInfo): Promise<Article[]> {
  const feed = await parser.parseURL(
    'https://news.google.com/rss/search?q=midudev&hl=es&gl=ES&ceid=ES:es'
  );

  if (!feed.items || feed.items.length === 0) {
    return [];
  }

  return feed.items.slice(0, 15).map((item, index) => {
    let title = (item.title || 'Midu noticia').replace(/\n+/g, ' ').trim();
    if (title.includes(' - ')) {
      title = title.split(' - ')[0].trim();
    }

    const snippet = item.contentSnippet || item.summary || 'Noticias relacionadas con midudev en la comunidad tech.';
    const pubDate = item.isoDate || item.pubDate || new Date().toISOString();
    const category = detectCategory(title, snippet, [], 'Software & Dev');
    const hashtags = extractHashtags(title, snippet, [], 'midudev', category);

    if (!hashtags.includes('#midudev')) {
      hashtags.unshift('#midudev');
    }

    return {
      id: `midudev-gnews-${index}-${pubDate}`,
      title,
      link: item.link || 'https://youtube.com/@midudev',
      pubDate,
      snippet,
      source: sourceInfo,
      category,
      author: 'midudev',
      imageUrl: sourceInfo.avatarUrl,
      hashtags,
      isSpecial: true,
      mediaType: 'article' as const,
    };
  });
}

/**
 * Fallback seed articles
 */
function getSeedArticles(sourceInfo: SourceInfo): Article[] {
  return SEED_VIDEOS.map((item) =>
    buildMiduArticle({
      videoId: item.videoId,
      title: item.title,
      timeText: `hace ${item.daysAgo} días`,
      viewsText: item.viewsText,
      snippet: item.snippet,
      sourceInfo,
      fallbackDays: item.daysAgo,
    })
  );
}

/**
 * Main aggregator for midudev content.
 * Guarantees articles are always returned and never empty.
 */
export async function fetchMidudevArticles(sourceInfo: SourceInfo): Promise<Article[]> {
  // Strategy 1: Fetch fresh videos from YouTube channel page
  try {
    const liveVideos = await fetchFromYouTubeChannel(sourceInfo);
    if (liveVideos.length > 0) {
      return liveVideos;
    }
  } catch (err: any) {
    console.warn('[midudevFetcher] Channel scrape failed:', err?.message || err);
  }

  // Strategy 2: Fetch mentions from Google News RSS
  try {
    const newsArticles = await fetchFromGoogleNews(sourceInfo);
    if (newsArticles.length > 0) {
      return newsArticles;
    }
  } catch (err: any) {
    console.warn('[midudevFetcher] Google News RSS failed:', err?.message || err);
  }

  // Strategy 3: Reliable curated seed videos (always succeeds)
  return getSeedArticles(sourceInfo);
}
