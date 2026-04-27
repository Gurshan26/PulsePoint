function classifyNPS(score) {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

function calculateNPS(scores) {
  if (!scores || scores.length === 0) return null;
  const valid = scores.filter((s) => s !== null && s !== undefined && s >= 0 && s <= 10);
  if (valid.length === 0) return null;

  const promoters = valid.filter((s) => s >= 9).length;
  const detractors = valid.filter((s) => s <= 6).length;
  const total = valid.length;
  const passives = total - promoters - detractors;

  return {
    score: Math.round(((promoters - detractors) / total) * 100),
    promoters,
    passives,
    detractors,
    total,
    promoterPct: Math.round((promoters / total) * 100),
    passivePct: Math.round((passives / total) * 100),
    detractorPct: Math.round((detractors / total) * 100)
  };
}

function calculateCSAT(scores) {
  if (!scores || scores.length === 0) return null;
  const valid = scores.filter((s) => s !== null && s !== undefined && s >= 1 && s <= 5);
  if (valid.length === 0) return null;
  const satisfied = valid.filter((s) => s >= 4).length;
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;

  return {
    score: Math.round((satisfied / valid.length) * 100),
    average: Math.round(avg * 10) / 10,
    total: valid.length,
    satisfiedPct: Math.round((satisfied / valid.length) * 100)
  };
}

function calculateCES(scores) {
  if (!scores || scores.length === 0) return null;
  const valid = scores.filter((s) => s !== null && s !== undefined && s >= 1 && s <= 7);
  if (valid.length === 0) return null;
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  const lowEffort = valid.filter((s) => s <= 3).length;

  return {
    average: Math.round(avg * 10) / 10,
    total: valid.length,
    lowEffortPct: Math.round((lowEffort / valid.length) * 100)
  };
}

function npsChange(current, previous) {
  if (current === null || previous === null || current === undefined || previous === undefined) return null;
  return current - previous;
}

module.exports = { classifyNPS, calculateNPS, calculateCSAT, calculateCES, npsChange };
