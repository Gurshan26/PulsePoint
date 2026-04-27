const { callGemini } = require('./gemini');

const CLUSTER_PROMPT = `You are a CX analyst clustering customer feedback themes.
Given a list of theme tags extracted from customer responses, identify the top 5-8 major theme clusters.
For each cluster, give a clear name, approximate count, and whether it is primarily positive, negative, or mixed.
Respond only in valid JSON:
{"clusters":[{"name":"string","count":1,"sentiment":"positive|negative|mixed","description":"one sentence","example_themes":["string"]}],"total_themes_analysed":1}`;

const PRIORITY_PROMPT = `You are a CX strategist identifying priority service issues.
Given aggregated customer experience data, identify the top 3-5 priority issues that need attention.
Rank by impact, combining frequency and negativity.
Respond only in valid JSON:
{"issues":[{"rank":1,"title":"short title","description":"2 sentences max","frequency":"high|medium|low","impact":"high|medium|low","recommended_action":"1 sentence"}]}`;

const SUMMARY_PROMPT = `You are a CX analyst writing an executive summary for stakeholders.
Write a concise, professional summary of the customer experience data provided.
Be direct, plain-language, and action-oriented.
Respond only in valid JSON:
{"headline":"one sentence","key_findings":["string","string","string"],"recommendation":"string","overall_rating":"improving|stable|declining"}`;

async function clusterThemes(allThemes) {
  if (!allThemes || allThemes.length === 0) return { clusters: [], total_themes_analysed: 0 };
  return callGemini(CLUSTER_PROMPT, `All extracted themes:\n${allThemes.join(', ')}`, true);
}

async function identifyPriorities(data) {
  const content = `CX Data Summary:
NPS: ${data.nps?.score ?? 'N/A'} (${data.nps?.total ?? 0} responses)
CSAT: ${data.csat?.score ?? 'N/A'}%
CES avg: ${data.ces?.average ?? 'N/A'}
Negative sentiment rate: ${data.sentimentBreakdown?.negativePct ?? 'N/A'}%
Top themes: ${data.topThemes?.join(', ') ?? 'none'}
Main complaints: ${data.mainComplaints?.join(', ') ?? 'none'}`;
  return callGemini(PRIORITY_PROMPT, content, true);
}

async function generateSummary(data) {
  const content = `Dataset: ${data.name}
Period: ${data.period}
Total responses: ${data.totalResponses}
NPS: ${data.nps?.score ?? 'N/A'}
CSAT: ${data.csat?.score ?? 'N/A'}%
Sentiment breakdown: ${JSON.stringify(data.sentimentBreakdown)}
Priority issues: ${JSON.stringify(data.issues)}
Top themes: ${data.topThemes?.slice(0, 10).join(', ')}`;
  return callGemini(SUMMARY_PROMPT, content, true);
}

module.exports = { clusterThemes, identifyPriorities, generateSummary };
