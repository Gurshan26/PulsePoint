import { BarChart3, BriefcaseBusiness, Crown } from 'lucide-react';
import styles from './ViewModeSwitcher.module.css';

const MODES = [
  { value: 'analyst', label: 'Analyst', icon: BarChart3 },
  { value: 'manager', label: 'Manager', icon: BriefcaseBusiness },
  { value: 'executive', label: 'Executive', icon: Crown }
];

export default function ViewModeSwitcher({ value, onChange }) {
  return (
    <div className={styles.switcher} role="group" aria-label="View mode">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        return (
          <button key={mode.value} type="button" className={`${styles.mode} ${value === mode.value ? styles.active : ''}`} onClick={() => onChange(mode.value)}>
            <Icon size={15} aria-hidden="true" />
            <span className={styles.modeLabel}>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
