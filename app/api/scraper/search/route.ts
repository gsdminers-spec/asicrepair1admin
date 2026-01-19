
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // Increased timeout for AI

    try {
        const { query } = await req.json();
        if (!query) {
            return NextResponse.json({ error: 'Query required' }, { status: 400 });
        }

        // 1. Scrape DuckDuckGo
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!res.ok) throw new Error(`Search provider error: ${res.status}`);
        const html = await res.text();
        const results = parseDuckDuckGoHtml(html).slice(0, 8); // Top 8 results

        // 2. AI Summarization & Key Findings
        let aiSummary = '';
        let keyFindings: string[] = [];

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            // Context construction
            const context = results.map(r => `Title: ${r.title}\nSnippet: ${r.snippet}`).join('\n\n');
            const prompt = `
            Analyze the following search results for the topic: "${query}".
            
            Search Results:
            ${context}

            1. Write a concise technical summary (max 3 sentences) explaining the core issue/topic.
            2. Extract 4 distinct, fact-based "Key Findings" (e.g. specific voltage specs, chip names, tools needed, or common failure causes).
            
            Output JSON format ONLY:
            {
                "summary": "string",
                "findings": ["finding1", "finding2", "finding3", "finding4"]
            }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean markdown json if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiData = JSON.parse(jsonStr);

            aiSummary = aiData.summary;
            keyFindings = aiData.findings;

        } catch (aiError) {
            console.error('AI Processing Failed:', aiError);
            // Fallback if AI fails
            aiSummary = 'AI Summarization unavailable. Please review sources manually.';
            keyFindings = ['Could not extract findings automatically.'];
        }

        return NextResponse.json({
            success: true,
            results,
            aiSummary,
            keyFindings
        });

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
