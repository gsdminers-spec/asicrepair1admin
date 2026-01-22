import { NextResponse } from 'next/server';
import { searchTavily, searchBrave, searchSerper, searchGemini } from '@/lib/researchProviders';
import { SearchResult } from '@/lib/types';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const topic = body.topic || body.query;

        // Keys
        const tavilyKey = process.env.TAVILY_API_KEY;
        const braveKey = process.env.BRAVE_API_KEY;
        const serperKey = process.env.SERPER_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        // 1. EXECUTE PARALLEL SEARCHES
        const promises = [];

        if (tavilyKey) promises.push(searchTavily(topic, tavilyKey));
        if (braveKey) promises.push(searchBrave(topic, braveKey));
        if (serperKey) promises.push(searchSerper(topic, serperKey));
        // Use Gemini Grounding as a search provider if key exists
        if (geminiKey) promises.push(searchGemini(topic, geminiKey));

        if (promises.length === 0) {
            return NextResponse.json({ error: 'No search providers configured' }, { status: 500 });
        }

        // Wait for all (fail resilient)
        const providerResults = await Promise.all(promises);

        // 2. AGGREGATE & DEDUPLICATE
        let allResults: SearchResult[] = [];
        const seenUrls = new Set<string>();

        providerResults.forEach(p => {
            if (p.results) {
                p.results.forEach(r => {
                    if (!seenUrls.has(r.url)) {
                        seenUrls.add(r.url);
                        allResults.push({ ...r, source: p.provider });
                    }
                });
            }
        });

        // Limit total context for Gemini (e.g., top 15 mixed results)
        allResults = allResults.slice(0, 15);

        // 3. GENERATE MASTER SUMMARY (AI)
        let summary = "";
        const openRouterKey = process.env.OPENROUTER_API_KEY;

        // PREPARE CONTEXT
        const contextText = allResults.map(r => `[${r.title}] ${r.content}`).join('\n\n');

        if (allResults.length > 0) {
            // OPTION A: OPENROUTER (Priority if Key Exists)
            if (openRouterKey) {
                try {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${openRouterKey}`,
                            "HTTP-Referer": "https://asicrepair.in", // Optional: Report your usage
                            "X-Title": "ASIC Admin",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": "google/gemini-2.0-flash-exp:free", // Free model as requested
                            "messages": [
                                {
                                    "role": "system",
                                    "content": "You are a research assistant. Synthesize the provided search results into a concise, high-level summary (3-4 sentences). Focus on technical accuracy."
                                },
                                {
                                    "role": "user",
                                    "content": `Search Results:\n${contextText}`
                                }
                            ]
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        summary = data.choices[0]?.message?.content || "";
                    } else {
                        console.error("OpenRouter Error:", await response.text());
                    }
                } catch (e) {
                    console.error("OpenRouter Exception:", e);
                }
            }

            // OPTION B: GEMINI DIRECT (Fallback if no OpenRouter or it failed)
            if (!summary && geminiKey) {
                try {
                    const { GoogleGenerativeAI } = require('@google/generative-ai');
                    const genAI = new GoogleGenerativeAI(geminiKey);
                    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

                    const context = allResults.map(r => `[${r.title}] ${r.content}`).join('\n\n');
                    const prompt = `You are a research assistant. Synthesize the following search results about "${topic}" into a concise, high-level summary (3-4 sentences). Focus on technical accuracy.
                
                ${context}`;

                    const result = await model.generateContent(prompt);
                    summary = result.response.text();
                } catch (e) {
                    console.error("Gemini Summary Failed:", e);
                    summary = "AI Summary generation failed, but results were found.";
                }
            }

            // 4. FORMAT KEY FINDINGS
            const keyFindings = allResults.map(r => `[${r.title}] ${r.content.substring(0, 150)}...`);

            return NextResponse.json({
                success: true,
                results: allResults,
                aiSummary: summary,
                keyFindings: keyFindings,
                sources: providerResults.map(p => p.provider) // Debug info
            });

        }

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
    }
}
