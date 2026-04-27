import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(isoStr, fmt = 'd MMM yyyy') {
  if (!isoStr) return '—';
  try {
    return format(parseISO(isoStr), fmt);
  } catch {
    return isoStr;
  }
}

export function formatRelative(isoStr) {
  if (!isoStr) return '';
  try {
    return formatDistanceToNow(parseISO(isoStr), { addSuffix: true });
  } catch {
    return isoStr;
  }
}

export function formatNPS(score) {
  if (score === null || score === undefined) return '—';
  return score > 0 ? `+${score}` : String(score);
}

export function formatPercent(val, decimals = 0) {
  if (val === null || val === undefined) return '—';
  return `${Number(val).toFixed(decimals)}%`;
}

export function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  return Number(val).toLocaleString('en-AU');
}

export function truncate(str, len = 120) {
  if (!str) return '';
  return str.length > len ? `${str.slice(0, len)}...` : str;
}

export function npsLabel(score) {
  if (score === null || score === undefined) return null;
  if (score >= 50) return 'Excellent';
  if (score >= 30) return 'Good';
  if (score >= 0) return 'Fair';
  return 'Poor';
}
