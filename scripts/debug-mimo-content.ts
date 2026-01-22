import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testMimoContent() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("Testing Mimo Content generation...");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Researcher Debug"
            },
            body: JSON.stringify({
                "model": "xiaomi/mimo-v2-flash:free",
                "messages": [{
                    "role": "user",
                    "content": "Write a 3 sentence summary about Bitcoin Mining."
                }],
                "reasoning": { "enabled": true }
            })
        });

        if (!response.ok) {
            console.error("HTTP ERROR:", response.status, await response.text());
            return;
        }

        const json = await response.json();
        const content = json.choices[0]?.message?.content;
        const reasoning = json.choices[0]?.message?.reasoning_details;

        console.log("--- CONTENT START ---");
        console.log(content);
        console.log("--- CONTENT END ---\n");

        console.log("--- REASONING START ---");
        console.log(reasoning);
        console.log("--- REASONING END ---");

        if (!content) console.error("FATAL: Content is empty/null");

    } catch (e: any) {
        console.error("Script Error:", e.message);
    }
}

testMimoContent();
