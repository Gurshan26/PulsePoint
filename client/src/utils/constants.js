export const DATE_OPTIONS = [
  { value: '7d', label: '7D', days: 7 },
  { value: '30d', label: '30D', days: 30 },
  { value: '90d', label: '90D', days: 90 },
  { value: '365d', label: '1Y', days: 365 }
];

export function dateRangeToQuery(value) {
  const option = DATE_OPTIONS.find((item) => item.value === value) || DATE_OPTIONS[2];
  const start = new Date(Date.now() - option.days * 86400000).toISOString().slice(0, 10);
  return `start=${start}`;
}
