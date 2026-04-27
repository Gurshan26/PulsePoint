import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AlertBanner from '../../components/AlertBanner/AlertBanner';
import DateRangePicker from '../../components/DateRangePicker/DateRangePicker';
import MetricCard from '../../components/MetricCard/MetricCard';
import NPSGauge from '../../components/NPSGauge/NPSGauge';
import PriorityIssues from '../../components/PriorityIssues/PriorityIssues';
import SentimentBar from '../../components/SentimentBar/SentimentBar';
import Skeleton from '../../components/shared/Skeleton';
import TrendChart from '../../components/TrendChart/TrendChart';
import VerbatimCard from '../../components/VerbatimCard/VerbatimCard';
import ViewModeSwitcher from '../../components/ViewModeSwitcher/ViewModeSwitcher';
import { useMetrics } from '../../hooks/useMetrics';
import { useTrends } from '../../hooks/useTrends';
import { useVerbatims } from '../../hooks/useVerbatims';
import { api } from '../../utils/api';
import { dateRangeToQuery } from '../../utils/constants';
import styles from './Overview.module.css';

const SUMMARY_FALLBACK = {
  headline: 'Customer experience risk is concentrated in wait times and digital banking friction.',
  key_findings: ['Detractor language is most common around repeat contacts.', 'Staff interactions still produce the strongest positive signal.', 'Digital self-service issues are pushing customers into assisted channels.'],
  recommendation: 'Prioritise callback coverage and the two highest-friction digital journeys.'
};

export default function Overview() {
  const { datasetId } = useParams();
  const [dateRange, setDateRange] = useState('90d');
  const [viewMode, setViewMode] = useState('analyst');
  const [summary, setSummary] = useState(SUMMARY_FALLBACK);
  const dateQuery = useMemo(() => dateRangeToQuery(dateRange), [dateRange]);
  const { metrics, alerts, loading, error } = useMetrics(datasetId, dateQuery);
  const { trend } = useTrends(datasetId, `metric=nps&granularity=week&${dateQuery}`);
  const { verbatims } = useVerbatims(datasetId, `limit=5&${dateQuery}`);

  useEffect(() => {
    api(`/api/insights/${datasetId}`)
      .then((data) => {
        const latest = data.insights?.find((item) => item.type === 'summary');
        const parsed = latest?.parsed || (latest?.content ? JSON.parse(latest.content) : null);
        if (parsed) setSummary(parsed);
      })
      .catch(() => setSummary(SUMMARY_FALLBACK));
  }, [datasetId]);

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <div>
          <h1>Overview</h1>
          <p>Headline metrics, priority issues, and the evidence underneath.</p>
        </div>
        <div className={styles.controlsRight}>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ViewModeSwitcher value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {alerts?.map((alert) => (
        <AlertBanner key={alert.id} alert={alert} />
      ))}

      {viewMode === 'executive' && (
        <section className={styles.executivePanel}>
          <span>Executive summary</span>
          <h2>{summary.headline}</h2>
          <div className={styles.executiveGrid}>
            {summary.key_findings?.slice(0, 3).map((finding) => (
              <p key={finding}>{finding}</p>
            ))}
          </div>
          <strong>{summary.recommendation}</strong>
        </section>
      )}

      <section className={styles.kpiRow}>
        {loading ? (
          <>
            <Skeleton height={214} />
            <Skeleton height={214} />
            <Skeleton height={214} />
            <Skeleton height={214} />
          </>
        ) : (
          <>
            <NPSGauge score={metrics?.nps?.score} promoterPct={metrics?.nps?.promoterPct} detractorPct={metrics?.nps?.detractorPct} total={metrics?.nps?.total} />
            <MetricCard
              label="CSAT"
              value={metrics?.csat?.score !== null && metrics?.csat?.score !== undefined ? `${metrics.csat.score}%` : '—'}
              subtitle={`${metrics?.csat?.total ?? 0} responses rating 4 or 5`}
              description="What this means: the share of customers who were satisfied this period."
              colour={metrics?.csat?.score >= 75 ? 'positive' : metrics?.csat?.score >= 55 ? 'neutral' : 'negative'}
              sparkline={[42, 52, 48, 62, 58, 74, 68]}
            />
            <MetricCard
              label="Customer Effort"
              value={metrics?.ces?.average ?? '—'}
              subtitle={`${metrics?.ces?.total ?? 0} responses, average out of 7`}
              description="What this means: lower effort means customers found the task easier."
              colour={metrics?.ces?.average <= 3.5 ? 'positive' : metrics?.ces?.average <= 5 ? 'neutral' : 'negative'}
              sparkline={[68, 60, 55, 48, 44, 42, 38]}
            />
            <MetricCard
              label="Responses"
              value={metrics?.totalResponses?.toLocaleString('en-AU') ?? '—'}
              subtitle="Survey and operational feedback this period"
              description="What this means: the volume of customer signal available for analysis."
              colour="violet"
              sparkline={[25, 32, 48, 36, 50, 64, 72]}
            />
          </>
        )}
      </section>

      {viewMode !== 'executive' && (
        <section className={styles.midRow}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Sentiment Breakdown</h3>
              <span>Qualitative signal</span>
            </div>
            {loading ? (
              <Skeleton height={90} />
            ) : (
              <SentimentBar
                positive={metrics?.sentimentBreakdown?.positivePct ?? 0}
                neutral={metrics?.sentimentBreakdown?.neutralPct ?? 0}
                negative={metrics?.sentimentBreakdown?.negativePct ?? 0}
                totals={metrics?.sentimentBreakdown}
              />
            )}
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Priority Issues</h3>
              <span>Ranked by impact</span>
            </div>
            <PriorityIssues datasetId={datasetId} />
          </div>
        </section>
      )}

      {viewMode === 'analyst' && (
        <section className={styles.bottomRow}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>NPS Trend</h3>
              <span>Weekly</span>
            </div>
            <TrendChart data={trend} metric="nps" compact />
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Recent Feedback</h3>
              <span>Verbatims</span>
            </div>
            <div className={styles.verbatimList}>
              {verbatims.map((item) => (
                <VerbatimCard key={item.id} verbatim={item} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {viewMode === 'analyst' && metrics?.topThemes?.length > 0 && (
        <section className={styles.themesPanel}>
          <div className={styles.panelHeader}>
            <h3>Top Themes</h3>
            <span>Frequency weighted</span>
          </div>
          <div className={styles.tagCloud}>
            {metrics.topThemes.map((theme) => (
              <span key={theme.name} className={styles.themeTag} style={{ fontSize: `${Math.max(0.82, Math.min(1.18, 0.82 + theme.count / 30))}rem` }}>
                {theme.name}
                <strong>{theme.count}</strong>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
