import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const CANDIDATES = [
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-2.0-flash-thinking-exp:free",
    "google/gemini-2.0-pro-exp-02-05:free"
];

async function checkModels() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("Checking Model Availability...");

    for (const model of CANDIDATES) {
        console.log(`\nTesting: ${model}...`);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://asicrepair.in",
                    "X-Title": "Model Check"
                },
                body: JSON.stringify({
                    "model": model,
                    "messages": [{ "role": "user", "content": "Hi" }]
                })
            });

            if (response.ok) {
                console.log(`✅ SUCCESS: ${model} is working!`);
                const data = await response.json();
                console.log("Output:", data.choices[0]?.message?.content);
                break; // Stop after finding the first working one
            } else {
                console.error(`❌ FAILED: ${model} - ${response.status} ${await response.text()}`);
            }
        } catch (e: any) {
            console.error(`❌ NETWORK ERROR: ${model}`, e.message);
        }
    }
}

checkModels();
