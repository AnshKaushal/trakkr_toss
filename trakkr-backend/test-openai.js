import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API });

async function getIceCreamBrands() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "List top 3 ice cream brands in India. Return only JSON." }],
            response_format: { type: "json_object" },
            temperature: 1,
            max_tokens: 1024
        });

        console.log(response.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

getIceCreamBrands();