import styles from './TouchpointHeatmap.module.css';

function intensity(value, type) {
  if (value === null || value === undefined) return 'transparent';
  if (type === 'nps') {
    const normalized = Math.max(0, Math.min(1, (value + 100) / 200));
    return `rgba(124, 58, 237, ${0.08 + normalized * 0.32})`;
  }
  if (type === 'csat') return `rgba(5, 150, 105, ${0.08 + Math.min(1, value / 5) * 0.34})`;
  if (type === 'negative') return `rgba(225, 29, 72, ${0.08 + Math.min(1, value / 25) * 0.36})`;
  return 'var(--blue-bg)';
}

export default function TouchpointHeatmap({ rows }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Touchpoint</th>
            <th>NPS</th>
            <th>CSAT avg</th>
            <th>CES avg</th>
            <th>Negative</th>
            <th>Responses</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.touchpoint}>
              <th>{row.touchpoint}</th>
              <td style={{ background: intensity(row.nps?.score, 'nps') }}>{row.nps?.score > 0 ? `+${row.nps.score}` : row.nps?.score ?? '—'}</td>
              <td style={{ background: intensity(row.avg_csat, 'csat') }}>{row.avg_csat ?? '—'}</td>
              <td>{row.avg_ces ?? '—'}</td>
              <td style={{ background: intensity(row.negative_count, 'negative') }}>{row.negative_count ?? 0}</td>
              <td>{row.response_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
