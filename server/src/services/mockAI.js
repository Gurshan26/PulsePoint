const MOCK_SENTIMENT_BATCH = (verbatims) =>
  verbatims.map((v) => {
    const lower = v.toLowerCase();
    if (['terrible', 'awful', 'frustrated', 'slow', 'broken', 'waited'].some((w) => lower.includes(w))) {
      return { sentiment: 'negative', themes: ['service quality', 'wait times'], confidence: 0.85 };
    }
    if (['great', 'excellent', 'love', 'helpful', 'quick', 'smooth'].some((w) => lower.includes(w))) {
      return { sentiment: 'positive', themes: ['staff friendliness', 'speed'], confidence: 0.88 };
    }
    return { sentiment: 'neutral', themes: ['general feedback'], confidence: 0.6 };
  });

const MOCK_THEMES = {
  clusters: [
    { name: 'Wait Times & Response Speed', count: 142, sentiment: 'negative', description: 'Customers consistently cite long wait times as the primary frustration.', example_themes: ['wait times', 'slow response', 'queue length'] },
    { name: 'Staff Helpfulness', count: 118, sentiment: 'positive', description: 'When customers reach a person, staff are generally rated highly.', example_themes: ['staff friendliness', 'helpful staff', 'knowledgeable'] },
    { name: 'Digital Experience', count: 97, sentiment: 'negative', description: 'Online portal and app usability are causing avoidable service contacts.', example_themes: ['website', 'app crashes', 'hard to navigate'] },
    { name: 'Billing & Pricing', count: 84, sentiment: 'negative', description: 'Billing errors and unclear fees are creating repeat contacts.', example_themes: ['billing issues', 'unexpected charges', 'price confusion'] },
    { name: 'Onboarding Experience', count: 63, sentiment: 'mixed', description: 'First-time customers find setup confusing but usually complete it.', example_themes: ['onboarding', 'first setup', 'getting started'] }
  ],
  total_themes_analysed: 504
};

const MOCK_PRIORITIES = {
  issues: [
    { rank: 1, title: 'Wait times consistently above threshold', description: 'Average wait-time complaints are concentrated in phone support and initial contact. This is the clearest driver of detractor growth.', frequency: 'high', impact: 'high', recommended_action: 'Add callback handling and inspect staffing coverage for weekday peaks.' },
    { rank: 2, title: 'Digital portal usability driving channel switching', description: 'Customers are abandoning self-service and moving to phone support. The extra contact volume is amplifying the wait-time issue.', frequency: 'high', impact: 'high', recommended_action: 'Prioritise account management and billing flows for usability review.' },
    { rank: 3, title: 'Billing disputes require repeat contacts', description: 'Billing-related verbatims have a high negative sentiment rate and low first-contact resolution. Customers describe inconsistent explanations.', frequency: 'medium', impact: 'high', recommended_action: 'Audit recent billing changes and create a fast path for fee reversals.' },
    { rank: 4, title: 'Resolution ownership is inconsistent', description: 'Customers frequently mention being transferred without clear ownership. This appears in both neutral and negative feedback.', frequency: 'medium', impact: 'medium', recommended_action: 'Review escalation rules and give frontline teams clearer resolution authority.' }
  ]
};

const MOCK_SUMMARY = {
  headline: 'Customer satisfaction is declining because digital friction and wait times are reinforcing each other.',
  key_findings: [
    'NPS is under pressure from detractors in phone support and digital banking.',
    'Positive sentiment remains strongest where customers interact with knowledgeable staff.',
    'The most actionable opportunity is to reduce avoidable contacts from the portal and billing flows.'
  ],
  recommendation: 'Prioritise callback coverage and the two highest-friction digital journeys before expanding reporting work.',
  overall_rating: 'declining'
};

function getMockResponse(systemPrompt, userContent = '') {
  const lower = systemPrompt.toLowerCase();
  if (lower.includes('priorit')) return MOCK_PRIORITIES;
  if (lower.includes('summary') || lower.includes('executive')) return MOCK_SUMMARY;
  if (lower.includes('cluster') || lower.includes('theme')) return MOCK_THEMES;
  if (lower.includes('sentiment')) {
    const lines = userContent.split('\n').filter((line) => /^\d+\./.test(line));
    return MOCK_SENTIMENT_BATCH(lines.length ? lines : [userContent]);
  }
  return { message: 'mock response' };
}

module.exports = { getMockResponse, MOCK_THEMES, MOCK_PRIORITIES, MOCK_SUMMARY, MOCK_SENTIMENT_BATCH };
