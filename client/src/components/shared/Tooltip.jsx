import { useState } from 'react';
import { Info } from 'lucide-react';
import styles from './Tooltip.module.css';

export default function Tooltip({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <span className={styles.wrap} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {children || (
        <button type="button" className={styles.trigger} aria-label={label}>
          <Info size={14} />
        </button>
      )}
      {open && <span className={styles.tip}>{label}</span>}
    </span>
  );
}
