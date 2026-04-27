import { DATE_OPTIONS } from '../../utils/constants';
import styles from './DateRangePicker.module.css';

export default function DateRangePicker({ value, onChange }) {
  return (
    <div className={styles.picker} role="group" aria-label="Date range">
      {DATE_OPTIONS.map((option) => (
        <button key={option.value} type="button" className={`${styles.option} ${value === option.value ? styles.active : ''}`} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
