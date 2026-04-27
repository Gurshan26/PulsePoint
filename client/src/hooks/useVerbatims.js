import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export function useVerbatims(datasetId, query) {
  const [state, setState] = useState({ verbatims: [], total: 0, pages: 0, loading: true, error: null });

  useEffect(() => {
    if (!datasetId) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    api(`/api/verbatims/${datasetId}${query ? `?${query}` : ''}`)
      .then((data) => {
        if (!cancelled) setState({ verbatims: data.verbatims || [], total: data.total || 0, pages: data.pages || 0, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ verbatims: [], total: 0, pages: 0, loading: false, error: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [datasetId, query]);

  return state;
}
