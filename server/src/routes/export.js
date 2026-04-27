const express = require('express');
const db = require('../db');
const { getMetricSummary } = require('./metrics');

const router = express.Router();

function quoteCsv(value) {
  const str = String(value ?? '');
  return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
}

router.get('/:datasetId/csv', (req, res) => {
  const { datasetId } = req.params;
  const { type = 'responses', start, end, sentiment, touchpoint } = req.query;

  let rows;
  let headers;

  if (type === 'responses') {
    const params = [datasetId];
    let filter = '';
    if (start) {
      filter += ' AND date >= ?';
      params.push(start);
    }
    if (end) {
      filter += ' AND date <= ?';
      params.push(end);
    }
    if (sentiment) {
      filter += ' AND sentiment = ?';
      params.push(sentiment);
    }
    if (touchpoint && touchpoint !== 'All') {
      filter += ' AND touchpoint = ?';
      params.push(touchpoint);
    }

    headers = ['id', 'date', 'channel', 'touchpoint', 'segment', 'nps_score', 'csat_score', 'ces_score', 'sentiment', 'themes', 'verbatim', 'region'];
    rows = db
      .prepare(`
        SELECT id, date, channel, touchpoint, segment, nps_score, csat_score, ces_score, sentiment, themes, verbatim, region
        FROM survey_responses
        WHERE dataset_id = ?${filter}
        ORDER BY date DESC
        LIMIT 10000
      `)
      .all(...params);
  } else if (type === 'metrics') {
    const summary = getMetricSummary(datasetId, { start, end, touchpoint });
    headers = ['metric', 'value', 'total'];
    rows = [
      { metric: 'nps', value: summary.nps?.score ?? '', total: summary.nps?.total ?? '' },
      { metric: 'csat', value: summary.csat?.score ?? '', total: summary.csat?.total ?? '' },
      { metric: 'ces_average', value: summary.ces?.average ?? '', total: summary.ces?.total ?? '' },
      { metric: 'response_volume', value: summary.totalResponses, total: summary.totalResponses },
      { metric: 'negative_rate', value: summary.sentimentBreakdown.negativePct, total: summary.sentimentBreakdown.negative }
    ];
  } else {
    return res.status(400).json({ error: 'Invalid export type' });
  }

  const csvRows = [headers.join(','), ...rows.map((row) => headers.map((header) => quoteCsv(row[header])).join(','))];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="pulsepoint-${type}-${Date.now()}.csv"`);
  res.send(csvRows.join('\n'));
});

module.exports = router;
