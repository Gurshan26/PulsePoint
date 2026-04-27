import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import DateRangePicker from '../../components/DateRangePicker/DateRangePicker';
import EmptyState from '../../components/shared/EmptyState';
import Skeleton from '../../components/shared/Skeleton';
import TouchpointHeatmap from '../../components/TouchpointHeatmap/TouchpointHeatmap';
import { api } from '../../utils/api';
import { dateRangeToQuery } from '../../utils/constants';
import styles from './Touchpoints.module.css';

export default function Touchpoints() {
  const { datasetId } = useParams();
  const [dateRange, setDateRange] = useState('90d');
  const [state, setState] = useState({ rows: [], loading: true, error: null });
  const dateQuery = useMemo(() => dateRangeToQuery(dateRange), [dateRange]);

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    api(`/api/metrics/${datasetId}/touchpoints?${dateQuery}`)
      .then((data) => setState({ rows: data.touchpoints || [], loading: false, error: null }))
      .catch((error) => setState({ rows: [], loading: false, error: error.message }));
  }, [datasetId, dateQuery]);

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <div>
          <h1>Touchpoints</h1>
          <p>Compare friction and response volume across the customer journey.</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <section className={styles.panel}>
        {state.loading ? <Skeleton height={360} /> : state.error ? <EmptyState title="Could not load touchpoints" message={state.error} /> : <TouchpointHeatmap rows={state.rows} />}
      </section>
    </div>
  );
}
