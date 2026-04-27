import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export function useTrends(datasetId, query) {
  const [state, setState] = useState({ trend: [], annotations: [], loading: true, error: null });

  useEffect(() => {
    if (!datasetId) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    api(`/api/trends/${datasetId}${query ? `?${query}` : ''}`)
      .then((data) => {
        if (!cancelled) setState({ trend: data.trend || [], annotations: data.annotations || [], loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ trend: [], annotations: [], loading: false, error: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [datasetId, query]);

  return state;
}
