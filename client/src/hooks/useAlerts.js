import { useMetrics } from './useMetrics';

export function useAlerts(datasetId, query) {
  const { alerts, loading, error } = useMetrics(datasetId, query);
  return { alerts, loading, error };
}
