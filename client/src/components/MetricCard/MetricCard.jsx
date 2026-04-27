import Tooltip from '../shared/Tooltip';
import styles from './MetricCard.module.css';

const COLOUR_MAP = {
  positive: { value: 'var(--positive)', bg: 'var(--positive-bg)' },
  negative: { value: 'var(--negative)', bg: 'var(--negative-bg)' },
  neutral: { value: 'var(--neutral)', bg: 'var(--neutral-bg)' },
  violet: { value: 'var(--violet)', bg: 'var(--violet-bg)' },
  blue: { value: 'var(--blue)', bg: 'var(--blue-bg)' }
};

export default function MetricCard({ label, value, subtitle, description, colour = 'blue', delta, deltaDir, sparkline }) {
  const clr = COLOUR_MAP[colour] || COLOUR_MAP.blue;
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {description && <Tooltip label={description} />}
      </div>
      <div className={styles.valueRow}>
        <span className={`${styles.value} metric-number count-in`} style={{ color: clr.value }}>
          {value ?? '—'}
        </span>
        {delta !== null && delta !== undefined && (
          <span className={`${styles.delta} ${deltaDir === 'down' ? styles.deltaDown : styles.deltaUp}`}>
            {deltaDir === 'down' ? 'Down' : 'Up'} {Math.abs(delta)}
          </span>
        )}
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.sparkline} style={{ background: clr.bg }} aria-hidden="true">
        {sparkline?.length ? sparkline.map((item, index) => <span key={index} style={{ height: `${Math.max(18, item)}%`, background: clr.value }} />) : null}
      </div>
    </div>
  );
}
