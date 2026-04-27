import styles from './Skeleton.module.css';

export default function Skeleton({ height = 120, width = '100%' }) {
  return <div className={styles.skeleton} style={{ height, width }} aria-label="Loading" />;
}
