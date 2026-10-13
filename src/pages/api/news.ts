import type { APIRoute } from 'astro';
import { aggregateNews } from '../../services/newsAggregator';

export const GET: APIRoute = async ({ url }) => {
  const force = url.searchParams.get('refresh') === 'true';

  try {
    const data = await aggregateNews(force);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        articles: [],
        total: 0,
        fetchedAt: new Date().toISOString(),
        sourcesStatus: [],
        error: error?.message || 'Error interno al agregar noticias',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
