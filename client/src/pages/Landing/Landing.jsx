import { Eye, Plus, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/shared/EmptyState';
import Modal from '../../components/shared/Modal';
import Skeleton from '../../components/shared/Skeleton';
import { api } from '../../utils/api';
import { formatDate, formatNumber } from '../../utils/formatters';
import styles from './Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', org_name: '', industry: 'General', description: '', passcode: 'view1234', admin_passcode: '' });

  const load = () => {
    setLoading(true);
    api('/api/datasets')
      .then((data) => setDatasets(data.datasets || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const authenticate = async (event) => {
    event.preventDefault();
    setAuthError('');
    try {
      const data = await api(`/api/datasets/${selected.id}/auth`, {
        method: 'POST',
        body: JSON.stringify({ passcode })
      });
      localStorage.setItem(`pulsepoint:${selected.id}:role`, data.role);
      navigate(`/datasets/${selected.id}`);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const createDataset = async (event) => {
    event.preventDefault();
    const data = await api('/api/datasets', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    setCreating(false);
    setForm({ name: '', org_name: '', industry: 'General', description: '', passcode: 'view1234', admin_passcode: '' });
    load();
    setSelected(data.dataset);
  };

  const openDataset = (dataset) => {
    if (dataset.id === 'demo-cx') {
      localStorage.setItem(`pulsepoint:${dataset.id}:role`, 'demo');
      navigate(`/datasets/${dataset.id}`);
      return;
    }
    setPasscode('');
    setAuthError('');
    setSelected(dataset);
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <span>PulsePoint</span>
        </div>
        <div>
          <h1>CX intelligence that actually gets used.</h1>
          <p>Choose a dataset to inspect customer struggle, sentiment, and recommended action in one working dashboard.</p>
        </div>
        <Button icon={Plus} variant="primary" onClick={() => setCreating(true)}>
          New Dataset
        </Button>
      </section>

      <section className={styles.datasetGrid}>
        {loading ? (
          <>
            <Skeleton height={180} />
            <Skeleton height={180} />
          </>
        ) : datasets.length ? (
          datasets.map((dataset) => (
            <button key={dataset.id} type="button" className={styles.datasetCard} onClick={() => openDataset(dataset)}>
              <span className={styles.industry}>{dataset.industry}</span>
              {dataset.id === 'demo-cx' && <span className={styles.demoBadge}>Demo: no passcode</span>}
              <strong>{dataset.name}</strong>
              <p>{dataset.description}</p>
              <div className={styles.cardMeta}>
                <span>{dataset.org_name}</span>
                <span>{formatNumber(dataset.response_count)} responses</span>
                <span>{formatDate(dataset.date_range_end)}</span>
              </div>
              {dataset.id === 'demo-cx' && (
                <span className={styles.openDemo}>
                  <Eye size={16} aria-hidden="true" />
                  Open demo
                </span>
              )}
            </button>
          ))
        ) : (
          <EmptyState title="No datasets yet" message="Create a dataset to start exploring customer experience data." />
        )}
      </section>

      {selected && (
        <Modal title="Dataset Access" onClose={() => setSelected(null)}>
          <form className={styles.authForm} onSubmit={authenticate}>
            <div className={styles.authDataset}>
              <ShieldCheck size={18} aria-hidden="true" />
              <div>
                <strong>{selected.name}</strong>
                <span>{selected.org_name}</span>
              </div>
            </div>
            <input autoFocus value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder="Passcode" type="password" required />
            {authError && <p className={styles.error}>{authError}</p>}
            <Button variant="primary" type="submit">
              Open Dashboard
            </Button>
          </form>
        </Modal>
      )}

      {creating && (
        <Modal title="Create Dataset" onClose={() => setCreating(false)}>
          <form className={styles.createForm} onSubmit={createDataset}>
            <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Dataset name" required />
            <input value={form.org_name} onChange={(event) => setForm((prev) => ({ ...prev, org_name: event.target.value }))} placeholder="Organisation" />
            <input value={form.industry} onChange={(event) => setForm((prev) => ({ ...prev, industry: event.target.value }))} placeholder="Industry" />
            <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" rows={3} />
            <input value={form.passcode} onChange={(event) => setForm((prev) => ({ ...prev, passcode: event.target.value }))} placeholder="Viewer passcode" />
            <input value={form.admin_passcode} onChange={(event) => setForm((prev) => ({ ...prev, admin_passcode: event.target.value }))} placeholder="Admin passcode" required minLength={6} />
            <Button variant="primary" type="submit">
              Create
            </Button>
          </form>
        </Modal>
      )}
    </main>
  );
}
