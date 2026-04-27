import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export function useMetrics(datasetId, query) {
  const [state, setState] = useState({ metrics: null, alerts: [], loading: true, error: null });

  useEffect(() => {
    if (!datasetId) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    api(`/api/metrics/${datasetId}${query ? `?${query}` : ''}`)
      .then((data) => {
        if (!cancelled) setState({ metrics: data.metrics, alerts: data.alerts || [], loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ metrics: null, alerts: [], loading: false, error: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [datasetId, query]);

  return state;
}
