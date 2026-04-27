export function sentimentColour(sentiment) {
  if (sentiment === 'positive') return 'var(--positive)';
  if (sentiment === 'negative') return 'var(--negative)';
  return 'var(--neutral)';
}

export function npsColour(score) {
  if (score === null || score === undefined) return 'var(--ink-4)';
  if (score >= 30) return 'var(--positive)';
  if (score >= 0) return 'var(--neutral)';
  return 'var(--negative)';
}

export function csatColour(score) {
  if (score === null || score === undefined) return 'var(--ink-4)';
  if (score >= 75) return 'var(--positive)';
  if (score >= 55) return 'var(--neutral)';
  return 'var(--negative)';
}

export function getDataColour(index) {
  const palette = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#E11D48', '#0891B2', '#4F46E5', '#B45309', '#047857'];
  return palette[index % palette.length];
}
