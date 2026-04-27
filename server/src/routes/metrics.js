const express = require('express');
const db = require('../db');
const { calculateNPS, calculateCSAT, calculateCES } = require('../services/npsCalc');
const { evaluateAlerts } = require('../services/alertEngine');

const router = express.Router();

function buildDateFilter(start, end) {
  if (start && end) return { clause: ' AND date >= ? AND date <= ?', params: [start, end] };
  if (start) return { clause: ' AND date >= ?', params: [start] };
  if (end) return { clause: ' AND date <= ?', params: [end] };
  return { clause: '', params: [] };
}

function buildFilteredClause(query) {
  const { start, end, touchpoint, segment } = query;
  const { clause, params } = buildDateFilter(start, end);
  let filterClause = clause;
  const filterParams = [...params];

  if (touchpoint && touchpoint !== 'All') {
    filterClause += ' AND touchpoint = ?';
    filterParams.push(touchpoint);
  }
  if (segment && segment !== 'All') {
    filterClause += ' AND segment = ?';
    filterParams.push(segment);
  }
  return { filterClause, filterParams };
}

function getMetricSummary(datasetId, query = {}) {
  const { filterClause, filterParams } = buildFilteredClause(query);

  const npsRows = db
    .prepare(`SELECT nps_score FROM survey_responses WHERE dataset_id = ? AND nps_score IS NOT NULL${filterClause}`)
    .all(datasetId, ...filterParams)
    .map((r) => r.nps_score);
  const csatRows = db
    .prepare(`SELECT csat_score FROM survey_responses WHERE dataset_id = ? AND csat_score IS NOT NULL${filterClause}`)
    .all(datasetId, ...filterParams)
    .map((r) => r.csat_score);
  const cesRows = db
    .prepare(`SELECT ces_score FROM survey_responses WHERE dataset_id = ? AND ces_score IS NOT NULL${filterClause}`)
    .all(datasetId, ...filterParams)
    .map((r) => r.ces_score);
  const totalResponses = db
    .prepare(`SELECT COUNT(*) AS c FROM survey_responses WHERE dataset_id = ?${filterClause}`)
    .get(datasetId, ...filterParams).c;

  const sentimentCounts = db
    .prepare(`
      SELECT sentiment, COUNT(*) AS count
      FROM survey_responses
      WHERE dataset_id = ? AND sentiment IS NOT NULL${filterClause}
      GROUP BY sentiment
    `)
    .all(datasetId, ...filterParams);

  const totalSentiment = sentimentCounts.reduce((sum, row) => sum + row.count, 0);
  const countFor = (sentiment) => sentimentCounts.find((row) => row.sentiment === sentiment)?.count || 0;
  const sentimentBreakdown = {
    positive: countFor('positive'),
    neutral: countFor('neutral'),
    negative: countFor('negative'),
    positivePct: totalSentiment > 0 ? Math.round((countFor('positive') / totalSentiment) * 100) : 0,
    neutralPct: totalSentiment > 0 ? Math.round((countFor('neutral') / totalSentiment) * 100) : 0,
    negativePct: totalSentiment > 0 ? Math.round((countFor('negative') / totalSentiment) * 100) : 0
  };

  const allTags = db
    .prepare(`SELECT category_tags FROM survey_responses WHERE dataset_id = ?${filterClause} AND category_tags != '[]'`)
    .all(datasetId, ...filterParams)
    .flatMap((row) => {
      try {
        return JSON.parse(row.category_tags);
      } catch {
        return [];
      }
    });

  const themeFreq = {};
  for (const tag of allTags) themeFreq[tag] = (themeFreq[tag] || 0) + 1;
  const topThemes = Object.entries(themeFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const touchpoints = db
    .prepare('SELECT DISTINCT touchpoint FROM survey_responses WHERE dataset_id = ? ORDER BY touchpoint')
    .all(datasetId)
    .map((r) => r.touchpoint);
  const segments = db
    .prepare('SELECT DISTINCT segment FROM survey_responses WHERE dataset_id = ? ORDER BY segment')
    .all(datasetId)
    .map((r) => r.segment);

  return {
    nps: calculateNPS(npsRows),
    csat: calculateCSAT(csatRows),
    ces: calculateCES(cesRows),
    totalResponses,
    sentimentBreakdown,
    topThemes,
    touchpoints,
    segments
  };
}

router.get('/:datasetId', (req, res) => {
  const metrics = getMetricSummary(req.params.datasetId, req.query);
  const alerts = evaluateAlerts(req.params.datasetId, metrics);
  res.json({ metrics, alerts });
});

router.get('/:datasetId/touchpoints', (req, res) => {
  const { datasetId } = req.params;
  const { start, end } = req.query;
  const { clause: dateClause, params: dateParams } = buildDateFilter(start, end);

  const rows = db
    .prepare(`
      SELECT touchpoint,
        COUNT(*) AS response_count,
        ROUND(AVG(nps_score), 1) AS avg_nps_score,
        ROUND(AVG(csat_score), 1) AS avg_csat,
        ROUND(AVG(ces_score), 1) AS avg_ces,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) AS negative_count,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) AS positive_count
      FROM survey_responses
      WHERE dataset_id = ?${dateClause}
      GROUP BY touchpoint
      ORDER BY response_count DESC
    `)
    .all(datasetId, ...dateParams);

  const touchpoints = rows.map((row) => {
    const scores = db
      .prepare(`SELECT nps_score FROM survey_responses WHERE dataset_id = ? AND touchpoint = ? AND nps_score IS NOT NULL${dateClause}`)
      .all(datasetId, row.touchpoint, ...dateParams)
      .map((r) => r.nps_score);
    return { ...row, nps: calculateNPS(scores) };
  });

  res.json({ touchpoints });
});

module.exports = router;
module.exports.getMetricSummary = getMetricSummary;
