const fetch = require('node-fetch');
const crypto = require('crypto');

let db;
function getDb() {
  if (!db) db = require('../db');
  return db;
}

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function cacheKey(system, user) {
  return crypto.createHash('sha256').update(`${system}|||${user}`).digest('hex');
}

async function callGemini(systemPrompt, userContent, expectJson = true) {
  const key = cacheKey(systemPrompt, userContent);
  const database = getDb();
  const cached = database.prepare('SELECT response FROM ai_cache WHERE cache_key = ?').get(key);
  if (cached) return JSON.parse(cached.response);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const { getMockResponse } = require('./mockAI');
    const mock = getMockResponse(systemPrompt, userContent);
    database.prepare('INSERT OR REPLACE INTO ai_cache (cache_key, response) VALUES (?, ?)').run(key, JSON.stringify(mock));
    return mock;
  }

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userContent }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      ...(expectJson ? { responseMimeType: 'application/json' } : {})
    }
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.status === 429) throw new Error('AI rate limit. Try again shortly.');
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');

  let result;
  try {
    result = JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    result = { raw: text };
  }

  database.prepare('INSERT OR REPLACE INTO ai_cache (cache_key, response) VALUES (?, ?)').run(key, JSON.stringify(result));
  const count = database.prepare('SELECT COUNT(*) AS c FROM ai_cache').get().c;
  if (count > 2000) {
    database
      .prepare('DELETE FROM ai_cache WHERE cache_key IN (SELECT cache_key FROM ai_cache ORDER BY created_at ASC LIMIT ?)')
      .run(count - 2000);
  }

  return result;
}

module.exports = { callGemini };
