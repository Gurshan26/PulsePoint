import { formatDate } from '../../utils/formatters';
import styles from './VerbatimCard.module.css';

const SENTIMENT_CONFIG = {
  positive: { colour: 'var(--positive)', bg: 'var(--positive-bg)', label: 'Positive' },
  neutral: { colour: 'var(--neutral)', bg: 'var(--neutral-bg)', label: 'Neutral' },
  negative: { colour: 'var(--negative)', bg: 'var(--negative-bg)', label: 'Negative' }
};

function parseThemes(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function VerbatimCard({ verbatim, compact = false }) {
  const config = SENTIMENT_CONFIG[verbatim.sentiment] || SENTIMENT_CONFIG.neutral;
  const themes = parseThemes(verbatim.themes || verbatim.category_tags);

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`} style={{ borderLeftColor: config.colour }}>
      <p className={styles.text}>"{verbatim.verbatim}"</p>
      <div className={styles.meta}>
        <span className={styles.sentimentChip} style={{ color: config.colour, background: config.bg }}>
          {config.label}
        </span>
        <span className={styles.touchpoint}>{verbatim.touchpoint}</span>
        <span className={styles.date}>{formatDate(verbatim.date, 'd MMM')}</span>
        {verbatim.nps_score !== null && verbatim.nps_score !== undefined && <span className={styles.npsScore}>NPS {verbatim.nps_score}</span>}
      </div>
      {!compact && themes.length > 0 && (
        <div className={styles.themes}>
          {themes.map((theme) => (
            <span key={theme} className={styles.theme}>
              {theme}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
