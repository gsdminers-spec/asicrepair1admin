const { GoogleGenerativeAI } = require('@google/generative-ai');

(async () => {
    try {
        const apiKey = 'AIzaSyAS4h6RFL2jKTR95xMn0Ynn_YyJdgZIwy4'; // User's key from .env.local
        const genAI = new GoogleGenerativeAI(apiKey);

        const modelsToTest = [
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-3-flash',
            'gemini-2.0-flash-exp' // Baseline
        ];

        console.log("--- Testing Advanced Gemini Models ---");

        for (const modelName of modelsToTest) {
            console.log(`\nTesting: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say "Hello" if you work.');
                console.log(`✅ ${modelName}: SUCCESS!`);
                console.log(`   Response: ${result.response.text()}`);
            } catch (e) {
                console.log(`❌ ${modelName}: FAILED.`);
                console.log(`   Error: ${e.message.substring(0, 100)}`);
            }
        }

    } catch (e) {
        console.error("Global Error:", e);
    }
})();
