const { GoogleGenerativeAI } = require('@google/generative-ai');

(async () => {
    try {
        const apiKey = 'AIzaSyAS4h6RFL2jKTR95xMn0Ynn_YyJdgZIwy4';
        const genAI = new GoogleGenerativeAI(apiKey);

        // The user specifically saw "gemini-2.5-flash" in their dashboard.
        // We will try that exact model name.
        const modelName = 'gemini-2.5-flash';

        console.log(`--- Testing Writer: ${modelName} ---`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent('Write a single sentence about the future of AI.');
        console.log(`✅ SUCCESS! ${modelName} is active.`);
        console.log("Response:", result.response.text());

    } catch (e) {
        console.log(`❌ FAILURE for gemini-2.5-flash.`);
        console.log(`   Error: ${e.message}`);
        if (e.message.includes('404')) console.log("   (404 means the name is valid in UI but not exposed to API yet)");
    }
})();
