import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

async function testArchitect() {
    console.log("\n--- TESTING 1: ARCHITECT (Llama 3.3) ---");
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) { console.error("MISSING GROQ_API_KEY"); return; }

    try {
        const groq = new Groq({ apiKey });
        const res = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Llama works'!" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log("SUCCESS:", res.choices[0]?.message?.content);
    } catch (e: any) {
        console.error("FAILED:", e.message);
    }
}

async function testVerifier() {
    console.log("\n--- TESTING 2: VERIFIER (Chimera R1) ---");
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) { console.error("MISSING OPENROUTER_API_KEY"); return; }

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "tngtech/deepseek-r1t2-chimera:free",
                "messages": [{ "role": "user", "content": "Say 'Chimera works'!" }]
            })
        });

        if (!res.ok) {
            console.error("FAILED HTTP:", res.status, await res.text());
        } else {
            const json = await res.json();
            console.log("SUCCESS:", json.choices[0]?.message?.content);
        }
    } catch (e: any) {
        console.error("FAILED:", e.message);
    }
}

async function testWriter() {
    console.log("\n--- TESTING 3: WRITER (Gemini 2.0 Flash) ---");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.error("MISSING GEMINI_API_KEY"); return; }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent("Say 'Gemini works'!");
        console.log("SUCCESS:", result.response.text());
    } catch (e: any) {
        console.error("FAILED:", e.message);
    }
}

async function run() {
    await testArchitect();
    await testVerifier();
    await testWriter();
}

run();
