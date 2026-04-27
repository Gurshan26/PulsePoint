import { Bot, Building2, ChartNoAxesCombined, ChevronLeft, Gauge, MessageSquareText, Network, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '', icon: Gauge, label: 'Overview', end: true },
  { to: 'trends', icon: TrendingUp, label: 'Trends' },
  { to: 'verbatims', icon: MessageSquareText, label: 'Verbatims' },
  { to: 'touchpoints', icon: Network, label: 'Touchpoints' },
  { to: 'insights', icon: Bot, label: 'AI Insights' }
];

export default function Sidebar({ dataset }) {
  return (
    <nav className={styles.sidebar} aria-label="Dashboard navigation">
      <div className={styles.brand}>
        <span className={styles.brandDot} />
        <span className={styles.brandName}>PulsePoint</span>
      </div>
      <div className={styles.datasetInfo}>
        <Building2 size={16} aria-hidden="true" />
        <div>
          <span className={styles.datasetName}>{dataset?.name || 'Loading'}</span>
          <span className={styles.orgName}>{dataset?.org_name || 'CX dataset'}</span>
        </div>
      </div>
      <div className={styles.navSection}>
        <span className={styles.sectionLabel}>Workspace</span>
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
      <div className={styles.sidebarFooter}>
        <ChartNoAxesCombined size={16} aria-hidden="true" />
        <span>Action-first CX metrics</span>
        <NavLink to="/" className={styles.backLink}>
          <ChevronLeft size={15} aria-hidden="true" />
          All datasets
        </NavLink>
      </div>
    </nav>
  );
}
