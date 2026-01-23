import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * THE WRITER COMMITTEE
 * 
 * Orchestrates the 3-Step Writing Process:
 * 1. SEO ARCHITECT (Llama 3.3 via Groq)
 * 2. FACT VERIFIER (Chimera R1 via OpenRouter)
 * 3. FINAL WRITER (Gemini 2.5 Flash via Google)
 */

interface CommitteeOutput {
    seoOutline: string;
    verificationNotes: string;
    finalArticle: string;
    error?: string;
}

// --- 1. SEO ARCHITECT ---
async function runSeoArchitect(topic: string, researchContext: string): Promise<string> {
    console.log("🏗️ [Architect] Llama 3.3 starting...");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Groq Rate Limit Protection: Llama 3.3 has a strict 12k TPM limit.
    // 20,000 chars is approx 5,000 tokens. + 2,000 output tokens = ~7,000 tokens. Safe.
    const SAFE_GROQ_CONTEXT = 20000;
    const truncatedContext = researchContext.substring(0, SAFE_GROQ_CONTEXT);

    const prompt = `
    TOPIC: ${topic}
    RESEARCH: ${truncatedContext} (Truncated for Groq Rate Limits)

    You are the SEO ARCHITECT.
    Create a comprehensive BLOG OUTLINE.
    
    1. Define the H1.
    2. Define H2s and H3s structure.
    3. List target keywords for each section.
    4. Define the Tone/Style.
    
    Return ONLY Markdown.
    `;

    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_completion_tokens: 2048,
    });

    return chatCompletion.choices[0]?.message?.content || "";
}

// --- 2. FACT VERIFIER (RESILIENT) ---
async function runFactVerifier(outline: string, researchContext: string): Promise<string> {
    console.log("🕵️ [Verifier] Chimera R1 starting...");
    const apiKey = process.env.OPENROUTER_API_KEY;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Verifier"
            },
            body: JSON.stringify({
                "model": "tngtech/deepseek-r1t2-chimera:free",
                "messages": [{
                    "role": "user",
                    "content": `Verify outline. Return "VERIFIED" or issues.\n\nCONTEXT: ${researchContext.substring(0, 5000)}\n\nOUTLINE: ${outline}`
                }]
            })
        });

        if (!response.ok) throw new Error(`Primary failed: ${response.status}`);
        const data = await response.json();
        return data.choices[0]?.message?.content || "Verified";

    } catch (e) {
        console.warn("Verifier Failed (Skipping to preserve flow):", e);
        return "Verification Skipped (AI Provider Error). Proceeding with unverified outline.";
    }
}

// --- 3. FINAL WRITER (GROQ MIGRATION) ---
async function runFinalWriter(topic: string, outline: string, researchContext: string, verification: string): Promise<string> {
    console.log("✍️ [Writer] Groq Llama 3.3 starting...");
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Missing GROQ_API_KEY");

    const groq = new Groq({ apiKey });

    // STRICT RATE LIMIT PROTECTION
    // Groq Limit: 12,000 Tokens/Minute.
    // Goal: Use max ~6,000 Input Tokens to allow ~4,000 Output Tokens.
    // 1 Token ~= 4 Chars. -> 6,000 Tokens ~= 24,000 Chars.
    // Safety Buffer: Limit Context to 15,000 Chars (~3,750 Tokens).
    const MAX_CONTEXT_CHARS = 15000;

    const finalPrompt = `
    You are the FINAL WRITER.
    
    TOPIC: ${topic}
    OUTLINE: ${outline}
    VERIFICATION NOTES: ${verification}
    
    RESEARCH DATA (Truncated for Rate Limits):
    ${researchContext.substring(0, MAX_CONTEXT_CHARS)}
    
    TASK:
    Write a High-Quality, Human-Like Blog Post (400 - 2000 words).
    
    STYLE & GOALS:
    1. **REPAIR CENTRIC**: You are an Expert ASIC Technician. Use correct industry jargon (e.g., "logs", "hashboards", "soldering", "diagnostics"). Be authoritative.
    2. **SEO FRIENDLY**: Naturally integrate keywords. Do not keyword stuff. Structure with clear H2/H3 for readability.
    3. **HUMANIZED & SALES DRIVEN**: 
       - ❌ Avoid AI fluff ("In the realm of...", "Unlock the potential...").
       - ✅ Write like a human speaking to a customer.
       - ✅ **GOAL**: Attract customers to our repair services/courses. solve their problem, then offer our help.
    4. **LENGTH**: 400 - 2000 words (including space for human edits).
    
    STRUCTURE:
    - **Hook**: Grab attention immediately (Repair problem/solution).
    - **Body**: Technical steps, diagrams (described), or analysis.
    - **Conclusion**: Summary + **Strong Call to Action** (Visit ASICREPAIR.IN).
    
    Synthesize the research. If research is thin, rely on your "Technician Persona" to fill gaps logically.
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: finalPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 4096, // Allow long articles
        });

        return chatCompletion.choices[0]?.message?.content || "Failed to generate article content.";
    } catch (e: any) {
        console.error("Writer (Groq) Failed:", e);
        // Fallback: If 70b fails (limit?), try 8b (faster/cheaper)
        try {
            console.log("⚠️ Switching to Llama 3.1 8b Fallback...");
            const fallbackCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: finalPrompt }],
                model: "llama-3.1-8b-instant",
                temperature: 0.7,
                max_completion_tokens: 4096,
            });
            return fallbackCompletion.choices[0]?.message?.content || "Failed to generate fallback article.";
        } catch (fallbackErr) {
            throw new Error(`Groq Writer Failed (Primary & Fallback): ${e.message}`);
        }
    }
}

// --- ORCHESTRATOR ---
export async function runCommittee(topic: string, researchContext: string): Promise<CommitteeOutput> {
    let outline = "";
    let verification = "";

    try {
        // 1. Architect (Groq - Usually Reliable)
        outline = await runSeoArchitect(topic, researchContext);

        // 2. Verifier (Soft Fail)
        verification = await runFactVerifier(outline, researchContext);

        // 3. Writer (With Fallback)
        const finalArticle = await runFinalWriter(topic, outline, researchContext, verification);

        return { seoOutline: outline, verificationNotes: verification, finalArticle };

    } catch (e: any) {
        console.error("Committee Critical Failure:", e);

        // RECOVERY: If we at least have the outline, return that!
        if (outline) {
            return {
                seoOutline: outline,
                verificationNotes: verification || "Skipped",
                finalArticle: `## ⚠️ AI Writer Quota Exceeded\n\n**The system generated the outline successfully, but the Writer AI is currently overloaded.**\n\n### Generated Outline:\n${outline}\n\n*Please copy this outline and use it manually, or try again in 10 minutes.*`,
                error: "Writer Failed, Outline Preserved."
            };
        }

        return { seoOutline: "", verificationNotes: "", finalArticle: "", error: e.message };
    }
}
