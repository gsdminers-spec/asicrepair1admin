
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Type for request body
interface GenerateRequest {
    topic: string;
    scrapedData?: { title: string; snippet: string }[];
    preferences?: { additionalNotes?: string };
}

export async function POST(req: NextRequest) {
    try {
        // 1. Validate Environment
        if (!genAI) {
            return NextResponse.json({ error: 'Server configuration error: Gemini API key missing' }, { status: 500 });
        }

        // 2. Validate Input
        const body = (await req.json()) as GenerateRequest;
        const { topic, scrapedData, preferences } = body;

        if (!topic || typeof topic !== 'string') {
            return NextResponse.json({ error: 'Validation Error: Topic is required' }, { status: 400 });
        }

        // 3. Construct Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Explicitly cast scrapedData to ensure type safety in map
        const context = scrapedData && Array.isArray(scrapedData)
            ? scrapedData.map((d) => `Source: ${d.title}\n${d.snippet}`).join('\n\n')
            : 'No external research provided.';

        const systemPrompt = `
      You are an expert prompt engineer for Claude 3.5 Sonnet.
      Goal: Create a detailed, architected prompt for writing a specialized technical article about ASIC Repair.
      
      TOPIC: ${topic}
      
      RESEARCH CONTEXT:
      ${context}
      
      USER PREFERENCES:
      ${preferences?.additionalNotes || 'Standard technical tone.'}
      
      OUTPUT FORMAT:
      Return ONLY the prompt text that the user should copy-paste to Claude.
    `;

        // 4. Generate
        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        return NextResponse.json({ success: true, prompt: responseText });

    } catch (error: unknown) {
        // Type-safe error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Gemini API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
    }
}
