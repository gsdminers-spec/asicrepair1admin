// Native fetch is available in Node 18+
(async () => {
    try {
        console.log("Fetching OpenRouter Model List...");
        const response = await fetch("https://openrouter.ai/api/v1/models");
        const data = await response.json();

        const allModels = data.data;
        console.log(`Total Models: ${allModels.length}`);

        const mimo = allModels.filter(m => m.id.toLowerCase().includes('mimo') || m.name.toLowerCase().includes('mimo'));
        const liquid = allModels.filter(m => m.id.toLowerCase().includes('liquid'));
        const mistral = allModels.filter(m => m.id.toLowerCase().includes('mistral'));
        const minicpm = allModels.filter(m => m.id.toLowerCase().includes('minicpm'));

        console.log("\n--- 'Mimo' Matches ---");
        if (mimo.length === 0) console.log("None found.");
        mimo.forEach(m => console.log(`ID: ${m.id} | Name: ${m.name}`));

        console.log("\n--- 'Liquid' (LFM) Matches ---");
        liquid.forEach(m => console.log(`ID: ${m.id} | Name: ${m.name}`));

        console.log("\n--- 'Mistral' V2 Matches ---");
        // Look for "Large 2" or "Nemo"
        mistral
            .filter(m => m.id.includes('large-2') || m.id.includes('nemo') || m.id.includes('ministral'))
            .forEach(m => console.log(`ID: ${m.id} | Name: ${m.name}`));

        console.log("\n--- 'Mini' Matches (MiniCPM, etc) ---");
        minicpm.forEach(m => console.log(`ID: ${m.id} | Name: ${m.name}`));

    } catch (e) {
        console.error("Error:", e.message);
    }
})();
