import { AlertTriangle, Flag } from 'lucide-react';
import styles from './AlertBanner.module.css';

export default function AlertBanner({ alert }) {
  const isCritical = alert.severity === 'critical';
  const Icon = isCritical ? AlertTriangle : Flag;
  return (
    <div className={`${styles.banner} ${isCritical ? styles.critical : styles.warning}`} role="alert">
      <Icon size={20} aria-hidden="true" />
      <div className={styles.content}>
        <strong>{alert.label}</strong>
        <span>
          {alert.metric.replace('_', ' ').toUpperCase()} is {alert.current} ({alert.operator} threshold of {alert.threshold})
        </span>
      </div>
    </div>
  );
}
