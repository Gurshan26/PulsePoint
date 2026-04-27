import { RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/shared/EmptyState';
import Skeleton from '../../components/shared/Skeleton';
import VerbatimCard from '../../components/VerbatimCard/VerbatimCard';
import { useMetrics } from '../../hooks/useMetrics';
import { useVerbatims } from '../../hooks/useVerbatims';
import { api } from '../../utils/api';
import styles from './Verbatims.module.css';

export default function Verbatims() {
  const { datasetId } = useParams();
  const [filters, setFilters] = useState({ sentiment: '', touchpoint: 'All', q: '', page: 1 });
  const [reload, setReload] = useState(0);
  const { metrics } = useMetrics(datasetId, '');
  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: '12', page: String(filters.page), reload: String(reload) });
    if (filters.sentiment) params.set('sentiment', filters.sentiment);
    if (filters.touchpoint && filters.touchpoint !== 'All') params.set('touchpoint', filters.touchpoint);
    if (filters.q) params.set('q', filters.q);
    return params.toString();
  }, [filters, reload]);
  const { verbatims, total, pages, loading, error } = useVerbatims(datasetId, query);

  const classify = async () => {
    await api(`/api/verbatims/${datasetId}/classify`, { method: 'POST', body: JSON.stringify({}) });
    setReload((value) => value + 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <div>
          <h1>Verbatims</h1>
          <p>Search and filter the raw voice of customer evidence.</p>
        </div>
        <Button variant="primary" icon={RefreshCw} onClick={classify}>
          Classify
        </Button>
      </div>

      <section className={styles.filterPanel}>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <input value={filters.q} onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value, page: 1 }))} placeholder="Search verbatims" />
        </label>
        <select value={filters.sentiment} onChange={(event) => setFilters((prev) => ({ ...prev, sentiment: event.target.value, page: 1 }))}>
          <option value="">All sentiment</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <select value={filters.touchpoint} onChange={(event) => setFilters((prev) => ({ ...prev, touchpoint: event.target.value, page: 1 }))}>
          <option>All</option>
          {metrics?.touchpoints?.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>

      <section className={styles.results}>
        <div className={styles.resultTop}>
          <h3>{total.toLocaleString('en-AU')} matching responses</h3>
          <span>Page {filters.page} of {Math.max(1, pages)}</span>
        </div>
        {loading ? (
          <div className={styles.list}>
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
          </div>
        ) : error ? (
          <EmptyState title="Could not load feedback" message={error} />
        ) : verbatims.length === 0 ? (
          <EmptyState title="No feedback found" message="Try a different filter or search term." />
        ) : (
          <div className={styles.list}>
            {verbatims.map((item) => (
              <VerbatimCard key={item.id} verbatim={item} />
            ))}
          </div>
        )}
        <div className={styles.pagination}>
          <Button variant="secondary" disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}>
            Previous
          </Button>
          <Button variant="secondary" disabled={filters.page >= pages} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}>
            Next
          </Button>
        </div>
      </section>
    </div>
  );
}
