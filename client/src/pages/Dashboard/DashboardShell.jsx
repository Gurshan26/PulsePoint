import { Outlet, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import TopBar from '../../components/TopBar/TopBar';
import { api } from '../../utils/api';
import Skeleton from '../../components/shared/Skeleton';
import styles from './DashboardShell.module.css';

export default function DashboardShell() {
  const { datasetId } = useParams();
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api(`/api/datasets/${datasetId}`)
      .then((data) => setDataset(data.dataset))
      .catch((err) => setError(err.message));
  }, [datasetId]);

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.shell}>
      <Sidebar dataset={dataset} />
      <main className={styles.main}>
        <TopBar dataset={dataset} />
        <div className={styles.content} data-dashboard-content>
          {dataset ? <Outlet context={{ dataset }} /> : <Skeleton height={420} />}
        </div>
      </main>
    </div>
  );
}
