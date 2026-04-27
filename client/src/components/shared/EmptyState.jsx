import styles from './EmptyState.module.css';

export default function EmptyState({ title = 'No data', message = 'There is nothing to show for this selection.' }) {
  return (
    <div className={styles.empty}>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
