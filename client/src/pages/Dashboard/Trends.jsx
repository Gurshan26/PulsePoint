import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import DateRangePicker from '../../components/DateRangePicker/DateRangePicker';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/shared/EmptyState';
import Skeleton from '../../components/shared/Skeleton';
import TrendChart from '../../components/TrendChart/TrendChart';
import { useMetrics } from '../../hooks/useMetrics';
import { useTrends } from '../../hooks/useTrends';
import { api } from '../../utils/api';
import { dateRangeToQuery } from '../../utils/constants';
import styles from './Trends.module.css';

const METRICS = [
  { value: 'nps', label: 'NPS' },
  { value: 'csat', label: 'CSAT' },
  { value: 'ces', label: 'CES' },
  { value: 'volume', label: 'Volume' },
  { value: 'sentiment', label: 'Negative sentiment' }
];

export default function Trends() {
  const { datasetId } = useParams();
  const [metric, setMetric] = useState('nps');
  const [dateRange, setDateRange] = useState('90d');
  const [touchpoint, setTouchpoint] = useState('All');
  const [reload, setReload] = useState(0);
  const [annotation, setAnnotation] = useState({ date: new Date().toISOString().slice(0, 10), label: '', description: '' });
  const dateQuery = useMemo(() => dateRangeToQuery(dateRange), [dateRange]);
  const { metrics } = useMetrics(datasetId, dateQuery);
  const query = `metric=${metric}&granularity=week&${dateQuery}${touchpoint !== 'All' ? `&touchpoint=${encodeURIComponent(touchpoint)}` : ''}&reload=${reload}`;
  const { trend, annotations, loading, error } = useTrends(datasetId, query);

  const submitAnnotation = async (event) => {
    event.preventDefault();
    await api(`/api/annotations/${datasetId}`, {
      method: 'POST',
      body: JSON.stringify({ ...annotation, metric })
    });
    setAnnotation((prev) => ({ ...prev, label: '', description: '' }));
    setReload((value) => value + 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <div>
          <h1>Trends</h1>
          <p>Time-series movement with contextual annotations.</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <section className={styles.chartPanel}>
        <div className={styles.filters}>
          <label>
            Metric
            <select value={metric} onChange={(event) => setMetric(event.target.value)}>
              {METRICS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Touchpoint
            <select value={touchpoint} onChange={(event) => setTouchpoint(event.target.value)}>
              <option>All</option>
              {metrics?.touchpoints?.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        {loading ? <Skeleton height={310} /> : error ? <EmptyState title="Trend unavailable" message={error} /> : <TrendChart data={trend} annotations={annotations} metric={metric} />}
      </section>

      <section className={styles.annotationPanel}>
        <div>
          <h3>Add Annotation</h3>
          <p>Attach context to the selected metric so the line tells a clearer story.</p>
        </div>
        <form onSubmit={submitAnnotation} className={styles.annotationForm}>
          <input type="date" value={annotation.date} onChange={(event) => setAnnotation((prev) => ({ ...prev, date: event.target.value }))} required />
          <input value={annotation.label} onChange={(event) => setAnnotation((prev) => ({ ...prev, label: event.target.value }))} placeholder="Label" required />
          <input value={annotation.description} onChange={(event) => setAnnotation((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" />
          <Button variant="primary" icon={Plus} type="submit">
            Add
          </Button>
        </form>
      </section>
    </div>
  );
}
