const axios = require("axios");

const askAi = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty");
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "google/gemini-2.5-flash",
                messages: messages,
                max_tokens: 2000,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const content = response?.data?.choices?.[0]?.message?.content;
        if (!content || !content.trim()) {
            throw new Error("AI returned empty reponse.");
        }
        return content


    } catch (error) {
        const apiError = error.response?.data?.error;
        const detail = apiError?.message || error.response?.data?.message || error.message;
        console.error("OpenRouter Error:", detail);
        throw new Error(detail);
    }
};

module.exports = { askAi };