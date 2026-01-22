(async () => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/models");
        const data = await response.json();
        const allModels = data.data;

        const xiaomi = allModels.filter(m => m.id.toLowerCase().includes('xiaomi') || m.name.toLowerCase().includes('mimo'));

        console.log("--- MATCHES ---");
        xiaomi.forEach(m => {
            console.log(`ID: "${m.id}"`);
            console.log(`Name: "${m.name}"`);
            console.log(`Pricing: Prompt=${m.pricing?.prompt}, Completion=${m.pricing?.completion}`);
            console.log("---");
        });

    } catch (e) {
        console.error("Error:", e.message);
    }
})();
