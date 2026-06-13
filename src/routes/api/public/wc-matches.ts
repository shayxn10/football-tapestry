import { createFileRoute } from '@tanstack/react-router'

// Server-side proxy for football-data.org (their API blocks browser CORS).
// Client calls /api/public/wc-matches?status=IN_PLAY or ?dateFrom=...&dateTo=...
export const Route = createFileRoute('/api/public/wc-matches')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env.VITE_FOOTBALL_DATA_KEY || process.env.FOOTBALL_DATA_KEY
        if (!apiKey) {
          return new Response(JSON.stringify({ matches: [], error: 'missing-key' }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
          })
        }

        const incoming = new URL(request.url)
        const allowed = ['status', 'dateFrom', 'dateTo', 'matchday', 'stage']
        const upstream = new URL('https://api.football-data.org/v4/competitions/WC/matches')
        for (const k of allowed) {
          const v = incoming.searchParams.get(k)
          if (v) upstream.searchParams.set(k, v)
        }

        try {
          const res = await fetch(upstream.toString(), {
            headers: { 'X-Auth-Token': apiKey },
          })
          const body = await res.text()
          return new Response(body, {
            status: res.status,
            headers: {
              'content-type': 'application/json',
              'cache-control': 'public, max-age=30',
            },
          })
        } catch (err) {
          return new Response(
            JSON.stringify({ matches: [], error: (err as Error).message }),
            { status: 502, headers: { 'content-type': 'application/json' } },
          )
        }
      },
    },
  },
})
