// backend/utils/groqClient.js
const Groq = require('groq-sdk');

let _client = null;

const getGroqClient = () => {
  if (_client) return _client;
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not set in environment');
  }
  _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _client;
};

const generateCompletion = async (systemPrompt, userPrompt, maxTokens = 1024) => {
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model:      process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    temperature: 0.3, // low temp = factual, consistent output
  });
  return response.choices[0]?.message?.content || '';
};

module.exports = { generateCompletion };