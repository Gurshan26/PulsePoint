import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import Skeleton from '../shared/Skeleton';
import styles from './PriorityIssues.module.css';

const FALLBACK = [
  { rank: 1, title: 'Wait times consistently above threshold', frequency: 'high', impact: 'high', recommended_action: 'Review peak staffing and add callback handling.' },
  { rank: 2, title: 'Digital portal usability driving calls', frequency: 'high', impact: 'high', recommended_action: 'Prioritise billing and account management flows.' },
  { rank: 3, title: 'Billing disputes causing repeat contacts', frequency: 'medium', impact: 'high', recommended_action: 'Audit recent billing exceptions.' },
  { rank: 4, title: 'Resolution ownership varies by channel', frequency: 'medium', impact: 'medium', recommended_action: 'Clarify escalation rules for frontline teams.' }
];

function parseContent(insight) {
  if (!insight) return null;
  if (insight.parsed) return insight.parsed;
  try {
    return JSON.parse(insight.content);
  } catch {
    return null;
  }
}

export default function PriorityIssues({ datasetId }) {
  const [issues, setIssues] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api(`/api/insights/${datasetId}`)
      .then((data) => {
        const priority = data.insights?.find((item) => item.type === 'priorities');
        const parsed = parseContent(priority);
        if (!cancelled) setIssues(parsed?.issues?.length ? parsed.issues : FALLBACK);
      })
      .catch(() => {
        if (!cancelled) setIssues(FALLBACK);
      });
    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  if (!issues) return <Skeleton height={180} />;

  return (
    <div className={styles.list}>
      {issues.slice(0, 4).map((issue, index) => (
        <div key={`${issue.rank}-${issue.title}`} className={styles.issue}>
          <span className={`${styles.heatDot} ${index === 0 ? styles.pulse : ''}`} data-impact={issue.impact || 'medium'} />
          <div>
            <div className={styles.issueTop}>
              <strong>{issue.title}</strong>
              <span>#{issue.rank || index + 1}</span>
            </div>
            <p>{issue.recommended_action}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
