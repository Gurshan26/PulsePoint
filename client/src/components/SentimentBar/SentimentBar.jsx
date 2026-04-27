import styles from './SentimentBar.module.css';

export default function SentimentBar({ positive, neutral, negative, totals }) {
  const segments = [
    { key: 'positive', label: 'Positive', value: positive, color: 'var(--positive)', count: totals?.positive },
    { key: 'neutral', label: 'Neutral', value: neutral, color: 'var(--neutral-mid)', count: totals?.neutral },
    { key: 'negative', label: 'Negative', value: negative, color: 'var(--negative)', count: totals?.negative }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.bar} role="img" aria-label={`Sentiment: ${positive}% positive, ${neutral}% neutral, ${negative}% negative`}>
        {segments.map((segment) => (
          <div key={segment.key} className={styles.segment} style={{ width: `${Math.max(0, segment.value)}%`, background: segment.color }} />
        ))}
      </div>
      <div className={styles.legend}>
        {segments.map((segment) => (
          <span key={segment.key} className={styles.legendItem} style={{ color: segment.color }}>
            <span className={styles.dot} style={{ background: segment.color }} />
            {segment.label} {segment.value}%
            {segment.count !== undefined && <span className={styles.count}>({segment.count})</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
