import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API,
});

(async () => {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: "List top 3 ice cream brands in India. Return only JSON." }],
  });

  console.log(response.choices[0].message.content);
})();
