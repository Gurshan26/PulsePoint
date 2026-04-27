const express = require('express');
const db = require('../db');
const { classifyBatch } = require('../services/sentiment');

const router = express.Router();

router.get('/:datasetId', (req, res) => {
  const { datasetId } = req.params;
  const { sentiment, touchpoint, theme, start, end, q, page = 1, limit = 20 } = req.query;
  const params = [datasetId];
  let filterClause = '';

  if (sentiment) {
    filterClause += ' AND sentiment = ?';
    params.push(sentiment);
  }
  if (touchpoint && touchpoint !== 'All') {
    filterClause += ' AND touchpoint = ?';
    params.push(touchpoint);
  }
  if (start) {
    filterClause += ' AND date >= ?';
    params.push(start);
  }
  if (end) {
    filterClause += ' AND date <= ?';
    params.push(end);
  }
  if (theme) {
    filterClause += ' AND category_tags LIKE ?';
    params.push(`%${theme}%`);
  }
  if (q) {
    filterClause += ' AND verbatim LIKE ?';
    params.push(`%${q}%`);
  }
  filterClause += ' AND verbatim IS NOT NULL AND LENGTH(verbatim) > 5';

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const total = db.prepare(`SELECT COUNT(*) AS c FROM survey_responses WHERE dataset_id = ?${filterClause}`).get(...params).c;
  const verbatims = db
    .prepare(`
      SELECT id, verbatim, sentiment, themes, category_tags, touchpoint, segment, date, nps_score, csat_score, channel, region
      FROM survey_responses
      WHERE dataset_id = ?${filterClause}
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `)
    .all(...params, limitNum, offset);

  res.json({ verbatims, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

router.post('/:datasetId/classify', async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const unprocessed = db
      .prepare(`
        SELECT id, verbatim FROM survey_responses
        WHERE dataset_id = ? AND verbatim IS NOT NULL AND LENGTH(verbatim) > 5 AND ai_processed = 0
        LIMIT 50
      `)
      .all(datasetId);

    if (unprocessed.length === 0) return res.json({ processed: 0, remaining: 0, message: 'All verbatims already classified' });

    const classifications = await classifyBatch(unprocessed.map((row) => row.verbatim));
    const update = db.prepare(`
      UPDATE survey_responses
      SET sentiment = ?, themes = ?, category_tags = ?, ai_processed = 1
      WHERE id = ?
    `);

    const tx = db.transaction(() => {
      for (let i = 0; i < unprocessed.length; i++) {
        const c = classifications[i] || { sentiment: 'neutral', themes: [] };
        update.run(c.sentiment, JSON.stringify(c.themes || []), JSON.stringify(c.themes || []), unprocessed[i].id);
      }
    });
    tx();

    const remaining = db
      .prepare(`
        SELECT COUNT(*) AS c FROM survey_responses
        WHERE dataset_id = ? AND verbatim IS NOT NULL AND LENGTH(verbatim) > 5 AND ai_processed = 0
      `)
      .get(datasetId).c;

    res.json({ processed: unprocessed.length, remaining });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
