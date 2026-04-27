import styles from './Modal.module.css';

export default function Modal({ title, children, onClose }) {
  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
