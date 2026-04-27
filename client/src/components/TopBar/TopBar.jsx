import { Download, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { formatDate, formatRelative } from '../../utils/formatters';
import { useExport } from '../../hooks/useExport';
import Button from '../shared/Button';
import styles from './TopBar.module.css';

export default function TopBar({ dataset }) {
  const { datasetId } = useParams();
  const { exportCSV, exportPDF } = useExport(datasetId);

  return (
    <header className={styles.topbar}>
      <div className={styles.context}>
        <span className={styles.eyebrow}>{dataset?.industry || 'Customer Experience'}</span>
        <strong>{dataset?.name || 'Loading dataset'}</strong>
        <span>{dataset?.date_range_start ? `${formatDate(dataset.date_range_start)} to ${formatDate(dataset.date_range_end)}` : 'Demo dataset'}</span>
      </div>
      <div className={styles.actions}>
        <span className={styles.refreshed}>Updated {formatRelative(dataset?.updated_at || dataset?.created_at)}</span>
        <Button variant="secondary" icon={Download} onClick={() => exportCSV('responses')}>
          CSV
        </Button>
        <Button variant="primary" icon={FileText} onClick={exportPDF}>
          PDF
        </Button>
      </div>
    </header>
  );
}
