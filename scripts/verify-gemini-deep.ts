import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config({ path: '.env.local' });

const CANDIDATES = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro-001",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp"
];

async function verifyDeep() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("FATAL: No GEMINI_API_KEY found.");
        return;
    }

    console.log(`Starting Deep Verification with Key: ${apiKey.substring(0, 10)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    let workingModel = "";

    for (const modelId of CANDIDATES) {
        process.stdout.write(`Testing ID: [${modelId}] ... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelId });
            const result = await model.generateContent("Test connection.");
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ SUCCESS! \n   Output: "${text.trim()}"`);
                workingModel = modelId;
                break; // Stop at first success
            }
        } catch (e: any) {
            // console.log(`❌ Failed: ${e.message}`);
            let msg = e.message || "Unknown Error";
            if (msg.includes("404")) msg = "404 Not Found";
            if (msg.includes("429")) msg = "429 Rate Limit";
            if (msg.includes("400")) msg = "400 Bad Request";
            console.log(`❌ ${msg}`);
        }
    }

    if (workingModel) {
        console.log(`\n🎉 CONCLUSION: The working model ID is: "${workingModel}"`);
    } else {
        console.log("\n💀 FAILURE: No working models found. Check API Key permissions.");
    }
}

verifyDeep();
