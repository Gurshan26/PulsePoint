export function downloadCSV(rows, headers, filename) {
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? '';
          const str = String(value);
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',')
    )
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `export-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
