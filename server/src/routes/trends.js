const express = require('express');
const db = require('../db');

const router = express.Router();

const FORMATS = { day: '%Y-%m-%d', week: '%Y-W%W', month: '%Y-%m' };

router.get('/:datasetId', (req, res) => {
  const { datasetId } = req.params;
  const { metric = 'nps', granularity = 'week', start, end, touchpoint } = req.query;
  const fmt = FORMATS[granularity] || FORMATS.week;
  const params = [datasetId];
  let extraFilter = '';

  if (start) {
    extraFilter += ' AND date >= ?';
    params.push(start);
  }
  if (end) {
    extraFilter += ' AND date <= ?';
    params.push(end);
  }
  if (touchpoint && touchpoint !== 'All') {
    extraFilter += ' AND touchpoint = ?';
    params.push(touchpoint);
  }

  let rows;
  if (metric === 'nps') {
    rows = db
      .prepare(`
        SELECT strftime(?, date) AS period,
          COUNT(*) AS total,
          SUM(CASE WHEN nps_score >= 9 THEN 1 ELSE 0 END) AS promoters,
          SUM(CASE WHEN nps_score <= 6 THEN 1 ELSE 0 END) AS detractors,
          ROUND((SUM(CASE WHEN nps_score >= 9 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) -
            (SUM(CASE WHEN nps_score <= 6 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 0) AS value
        FROM survey_responses
        WHERE dataset_id = ? AND nps_score IS NOT NULL${extraFilter}
        GROUP BY period
        ORDER BY period
      `)
      .all(fmt, ...params);
  } else if (metric === 'csat') {
    rows = db
      .prepare(`
        SELECT strftime(?, date) AS period,
          COUNT(*) AS total,
          ROUND(SUM(CASE WHEN csat_score >= 4 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS value
        FROM survey_responses
        WHERE dataset_id = ? AND csat_score IS NOT NULL${extraFilter}
        GROUP BY period
        ORDER BY period
      `)
      .all(fmt, ...params);
  } else if (metric === 'ces') {
    rows = db
      .prepare(`
        SELECT strftime(?, date) AS period,
          COUNT(*) AS total,
          ROUND(AVG(ces_score), 2) AS value
        FROM survey_responses
        WHERE dataset_id = ? AND ces_score IS NOT NULL${extraFilter}
        GROUP BY period
        ORDER BY period
      `)
      .all(fmt, ...params);
  } else if (metric === 'volume') {
    rows = db
      .prepare(`
        SELECT strftime(?, date) AS period, COUNT(*) AS value, COUNT(*) AS total
        FROM survey_responses
        WHERE dataset_id = ?${extraFilter}
        GROUP BY period
        ORDER BY period
      `)
      .all(fmt, ...params);
  } else if (metric === 'sentiment') {
    rows = db
      .prepare(`
        SELECT strftime(?, date) AS period,
          COUNT(*) AS total,
          SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) AS positive,
          SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) AS negative,
          ROUND(SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS value
        FROM survey_responses
        WHERE dataset_id = ? AND sentiment IS NOT NULL${extraFilter}
        GROUP BY period
        ORDER BY period
      `)
      .all(fmt, ...params);
  } else {
    return res.status(400).json({ error: `Invalid metric: ${metric}` });
  }

  let annotationQuery = 'SELECT *, strftime(?, date) AS period FROM annotations WHERE dataset_id = ?';
  const annotationParams = [fmt, datasetId];
  if (start) {
    annotationQuery += ' AND date >= ?';
    annotationParams.push(start);
  }
  if (end) {
    annotationQuery += ' AND date <= ?';
    annotationParams.push(end);
  }
  annotationQuery += " AND (metric = 'all' OR metric = ?) ORDER BY date";
  annotationParams.push(metric);
  const annotations = db.prepare(annotationQuery).all(...annotationParams);

  res.json({ trend: rows, annotations, metric, granularity });
});

module.exports = router;
