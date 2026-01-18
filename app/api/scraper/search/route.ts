
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
        const { query } = await req.json();
        if (!query) {
            return NextResponse.json({ error: 'Query required' }, { status: 400 });
        }

        // Use DuckDuckGo HTML endpoint
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!res.ok) throw new Error(`Search provider error: ${res.status}`);

        const html = await res.text();
        const results = parseDuckDuckGoHtml(html);

        return NextResponse.json({ success: true, results: results.slice(0, 8) });

    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json({ error: 'Search timed out' }, { status: 504 });
        }
        console.error('Scraper Error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    } finally {
        clearTimeout(timeoutId);
    }
}

// Simple regex parser
function parseDuckDuckGoHtml(html: string) {
    const results = [];
    const linkRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const snippetRegex = /<a[^>]+class="result__snippet"[^>]+>([^<]+)<\/a>/g;

    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        const url = match[1];
        const title = match[2];

        snippetRegex.lastIndex = linkRegex.lastIndex;
        const snipMatch = snippetRegex.exec(html);
        const snippet = snipMatch ? snipMatch[1] : '';

        if (url && title) {
            results.push({ title, url, snippet });
        }
    }
    return results;
}
