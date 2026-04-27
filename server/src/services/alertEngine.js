const db = require('../db');

function evaluateAlerts(datasetId, currentMetrics) {
  const thresholds = db.prepare('SELECT * FROM alert_thresholds WHERE dataset_id = ? AND active = 1').all(datasetId);
  const triggered = [];

  for (const t of thresholds) {
    let currentValue = null;
    switch (t.metric) {
      case 'nps':
        currentValue = currentMetrics.nps?.score;
        break;
      case 'csat':
        currentValue = currentMetrics.csat?.score;
        break;
      case 'ces':
        currentValue = currentMetrics.ces?.average;
        break;
      case 'response_volume':
        currentValue = currentMetrics.totalResponses;
        break;
      case 'negative_rate':
        currentValue = currentMetrics.sentimentBreakdown?.negativePct;
        break;
      default:
        currentValue = null;
    }

    if (currentValue === null || currentValue === undefined) continue;
    const isTriggered =
      (t.operator === 'below' && currentValue < t.threshold) ||
      (t.operator === 'above' && currentValue > t.threshold);

    if (isTriggered) {
      triggered.push({
        id: t.id,
        label: t.label,
        metric: t.metric,
        operator: t.operator,
        threshold: t.threshold,
        current: currentValue,
        severity: t.severity
      });
    }
  }

  return triggered;
}

module.exports = { evaluateAlerts };
