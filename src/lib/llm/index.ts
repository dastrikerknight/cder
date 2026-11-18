import { LLMConfig } from '../types';

export interface GenerateTextParams {
  systemPrompt: string;
  userPrompt: string;
  config: LLMConfig;
  temperature?: number;
}

export async function generateText({
  systemPrompt,
  userPrompt,
  config,
  temperature = 0.2,
}: GenerateTextParams): Promise<string> {
  const provider = config.provider;

  switch (provider) {
    case 'gemini':
      return callGemini(systemPrompt, userPrompt, config, temperature);
    case 'anthropic':
      return callAnthropic(systemPrompt, userPrompt, config, temperature);
    case 'openai':
    case 'groq':
    case 'openrouter':
    default:
      return callOpenAICompatible(systemPrompt, userPrompt, config, temperature);
  }
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  config: LLMConfig,
  temperature: number
): Promise<string> {
  const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API Key. Provide it in Settings or set GEMINI_API_KEY env var.');
  }

  const model = config.model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}

async function callAnthropic(
  systemPrompt: string,
  userPrompt: string,
  config: LLMConfig,
  temperature: number
): Promise<string> {
  const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Anthropic API Key. Provide it in Settings or set ANTHROPIC_API_KEY env var.');
  }

  const model = config.model || 'claude-3-5-sonnet-20241022';
  const url = 'https://api.anthropic.com/v1/messages';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) {
    throw new Error('Anthropic returned an empty response.');
  }

  return text;
}

async function callOpenAICompatible(
  systemPrompt: string,
  userPrompt: string,
  config: LLMConfig,
  temperature: number
): Promise<string> {
  let baseUrl = 'https://api.openai.com/v1';
  let apiKey = config.apiKey || process.env.OPENAI_API_KEY;

  if (config.provider === 'groq') {
    baseUrl = 'https://api.groq.com/openai/v1';
    apiKey = config.apiKey || process.env.GROQ_API_KEY;
  } else if (config.provider === 'openrouter') {
    baseUrl = 'https://openrouter.ai/api/v1';
    apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
  }

  if (!apiKey) {
    throw new Error(`Missing API Key for ${config.provider}. Provide it in Settings or set environment variable.`);
  }

  const model = config.model || (config.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o');

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${config.provider} API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error(`${config.provider} returned an empty response.`);
  }

  return text;
}
