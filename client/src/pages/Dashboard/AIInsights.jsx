import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/shared/EmptyState';
import Skeleton from '../../components/shared/Skeleton';
import { api } from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import styles from './AIInsights.module.css';

function parseInsight(insight) {
  if (!insight) return null;
  if (insight.parsed) return insight.parsed;
  try {
    return JSON.parse(insight.content);
  } catch {
    return null;
  }
}

export default function AIInsights() {
  const { datasetId } = useParams();
  const [insights, setInsights] = useState([]);
  const [result, setResult] = useState(null);
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    api(`/api/insights/${datasetId}`)
      .then((data) => setInsights(data.insights || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [datasetId]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const data = await api(`/api/insights/${datasetId}/generate`, {
        method: 'POST',
        body: JSON.stringify({ type, period: 'Current selection' })
      });
      setResult(data);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const latestSummary = result?.summary || parseInsight(insights.find((item) => item.type === 'summary'));
  const latestPriorities = result?.priorities || parseInsight(insights.find((item) => item.type === 'priorities'));
  const latestThemes = result?.themes || parseInsight(insights.find((item) => item.type === 'themes'));

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <div>
          <h1>AI Insights</h1>
          <p>Generate stakeholder-ready summaries, priorities, and theme clusters.</p>
        </div>
        <div className={styles.actions}>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">All insights</option>
            <option value="summary">Summary</option>
            <option value="priorities">Priorities</option>
            <option value="themes">Themes</option>
          </select>
          <Button variant="primary" icon={Sparkles} onClick={generate} disabled={generating}>
            {generating ? 'Generating' : 'Generate'}
          </Button>
        </div>
      </div>

      {error && <EmptyState title="AI request failed" message={error} />}
      {loading ? (
        <Skeleton height={360} />
      ) : (
        <div className={styles.grid}>
          <section className={styles.summaryPanel}>
            <span>Executive summary</span>
            {latestSummary ? (
              <>
                <h2>{latestSummary.headline}</h2>
                <ul>
                  {latestSummary.key_findings?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <strong>{latestSummary.recommendation}</strong>
              </>
            ) : (
              <EmptyState title="No summary yet" message="Generate an insight set to create one." />
            )}
          </section>

          <section className={styles.panel}>
            <h3>Priority Issues</h3>
            <div className={styles.issueList}>
              {latestPriorities?.issues?.length ? (
                latestPriorities.issues.map((issue) => (
                  <article key={issue.title} className={styles.issue}>
                    <span>#{issue.rank}</span>
                    <div>
                      <strong>{issue.title}</strong>
                      <p>{issue.description}</p>
                      <em>{issue.recommended_action}</em>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="No priorities yet" message="Generate priorities to populate this panel." />
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <h3>Theme Clusters</h3>
            <div className={styles.clusterList}>
              {latestThemes?.clusters?.length ? (
                latestThemes.clusters.map((cluster) => (
                  <article key={cluster.name} className={styles.cluster} data-sentiment={cluster.sentiment}>
                    <div>
                      <strong>{cluster.name}</strong>
                      <span>{cluster.count} mentions</span>
                    </div>
                    <p>{cluster.description}</p>
                  </article>
                ))
              ) : (
                <EmptyState title="No clusters yet" message="Generate theme clusters to populate this panel." />
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <h3>Saved Insights</h3>
            <div className={styles.savedList}>
              {insights.length ? (
                insights.map((insight) => (
                  <div key={insight.id} className={styles.saved}>
                    <strong>{insight.type}</strong>
                    <span>{insight.period} · {formatDate(insight.created_at)}</span>
                  </div>
                ))
              ) : (
                <EmptyState title="No saved insights" message="Generated insights will be stored here." />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
