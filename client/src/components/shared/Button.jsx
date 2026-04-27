import styles from './Button.module.css';

export default function Button({ children, variant = 'secondary', icon: Icon, className = '', ...props }) {
  return (
    <button className={`${styles.button} ${styles[variant] || styles.secondary} ${className}`} {...props}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
