const OPENROUTER_API_KEY = "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";

(async () => {
    const modelId = "xiaomi/mimo-v2-flash:free"; // As entered by user
    // Also try canonical Xiaomi name just in case
    // const backupId = "tiiuae/falcon-180b-chat"; 

    console.log(`--- Testing Specific ID: ${modelId} ---`);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Test",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: modelId,
                messages: [{ role: "user", content: "Reply with the word SUCCESS." }],
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.log(`❌ FAILED [${response.status}]: ${err.substring(0, 150)}`);
        } else {
            const data = await response.json();
            if (data.error) {
                console.log(`❌ API ERROR: ${JSON.stringify(data.error)}`);
            } else {
                console.log(`✅ SUCCESS! Response: "${data.choices?.[0]?.message?.content}"`);
            }
        }

    } catch (e) {
        console.log(`❌ EXCEPTION: ${e.message}`);
    }
})();
