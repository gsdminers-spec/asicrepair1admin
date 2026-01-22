import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config({ path: '.env.local' });

async function testGoogleSDK() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found.");
        return;
    }

    console.log("Testing Google AI Studio (Gemini SDK)...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const result = await model.generateContent("Write a 1-sentence slogan for Bitcoin.");
        console.log("Output:", result.response.text());

    } catch (e: any) {
        console.error("Google SDK Failed:", e.message);
    }
}

testGoogleSDK();
