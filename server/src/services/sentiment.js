const { callGemini } = require('./gemini');

const SYSTEM_PROMPT = `You are a customer experience sentiment analyst.
Classify each piece of customer feedback as positive, neutral, or negative.
Also identify 1-3 concise theme tags, such as "wait times", "staff friendliness", or "billing issues".
Respond only in valid JSON array format, one object per input, in the same order:
[{"sentiment":"positive|neutral|negative","themes":["theme1","theme2"],"confidence":0.0}]`;

async function classifyBatch(verbatims) {
  if (!verbatims || verbatims.length === 0) return [];
  const batches = [];
  for (let i = 0; i < verbatims.length; i += 20) batches.push(verbatims.slice(i, i + 20));

  const results = [];
  for (const batch of batches) {
    const content = batch.map((v, i) => `${i + 1}. "${v}"`).join('\n');
    try {
      const response = await callGemini(SYSTEM_PROMPT, content, true);
      const parsed = Array.isArray(response) ? response : JSON.parse(response);
      results.push(...parsed.slice(0, batch.length));
    } catch {
      results.push(...batch.map((v) => keywordSentiment(v)));
    }
  }

  return results;
}

function keywordSentiment(text = '') {
  const lower = text.toLowerCase();
  const positiveWords = ['great', 'excellent', 'love', 'perfect', 'happy', 'fantastic', 'amazing', 'good', 'helpful', 'quick', 'smooth'];
  const negativeWords = ['terrible', 'awful', 'frustrated', 'slow', 'broken', 'useless', 'horrible', 'poor', 'bad', 'difficult', 'impossible', 'waited'];

  const posHits = positiveWords.filter((w) => lower.includes(w)).length;
  const negHits = negativeWords.filter((w) => lower.includes(w)).length;

  if (posHits > negHits) return { sentiment: 'positive', themes: inferThemes(lower), confidence: 0.65 };
  if (negHits > posHits) return { sentiment: 'negative', themes: inferThemes(lower), confidence: 0.65 };
  return { sentiment: 'neutral', themes: inferThemes(lower), confidence: 0.5 };
}

function inferThemes(lower) {
  const themes = [];
  if (lower.includes('wait') || lower.includes('hold') || lower.includes('slow')) themes.push('wait times');
  if (lower.includes('app') || lower.includes('portal') || lower.includes('online')) themes.push('digital experience');
  if (lower.includes('bill') || lower.includes('fee') || lower.includes('charged')) themes.push('billing issues');
  if (lower.includes('staff') || lower.includes('consultant') || lower.includes('agent')) themes.push('staff helpfulness');
  if (lower.includes('loan') || lower.includes('account')) themes.push('account onboarding');
  return themes.length ? themes.slice(0, 3) : ['general feedback'];
}

module.exports = { classifyBatch, keywordSentiment };
