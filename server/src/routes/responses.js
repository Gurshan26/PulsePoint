const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

router.post('/:datasetId', (req, res) => {
  const { responses } = req.body;
  if (!Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'responses must be a non-empty array' });
  }
  if (responses.length > 2000) {
    return res.status(400).json({ error: 'Max 2000 responses per batch' });
  }

  const dataset = db.prepare('SELECT id FROM datasets WHERE id = ?').get(req.params.datasetId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

  const validNps = (v) => v === null || v === undefined || (Number.isInteger(v) && v >= 0 && v <= 10);
  const validCsat = (v) => v === null || v === undefined || (Number(v) >= 1 && Number(v) <= 5);
  const validCes = (v) => v === null || v === undefined || (Number(v) >= 1 && Number(v) <= 7);
  const validSentiment = (v) => !v || ['positive', 'neutral', 'negative'].includes(v);

  const insert = db.prepare(`
    INSERT INTO survey_responses
      (id, dataset_id, channel, touchpoint, segment, nps_score, csat_score, ces_score, verbatim, sentiment, themes, category_tags, date, region, ai_processed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows) => {
    let imported = 0;
    for (const r of rows) {
      if (!r.date) continue;
      if (!validNps(r.nps_score)) continue;
      if (!validCsat(r.csat_score)) continue;
      if (!validCes(r.ces_score)) continue;
      if (!validSentiment(r.sentiment)) continue;
      const themes = Array.isArray(r.themes) ? r.themes : [];
      const tags = Array.isArray(r.category_tags) ? r.category_tags : themes;
      insert.run(
        crypto.randomUUID(),
        req.params.datasetId,
        r.channel || 'Survey',
        r.touchpoint || 'General',
        r.segment || 'All',
        r.nps_score ?? null,
        r.csat_score ?? null,
        r.ces_score ?? null,
        r.verbatim || null,
        r.sentiment || null,
        JSON.stringify(themes),
        JSON.stringify(tags),
        r.date,
        r.region || null,
        r.sentiment ? 1 : 0
      );
      imported++;
    }
    db.prepare(`
      UPDATE datasets
      SET response_count = (SELECT COUNT(*) FROM survey_responses WHERE dataset_id = ?),
          date_range_start = (SELECT MIN(date) FROM survey_responses WHERE dataset_id = ?),
          date_range_end = (SELECT MAX(date) FROM survey_responses WHERE dataset_id = ?),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(req.params.datasetId, req.params.datasetId, req.params.datasetId, req.params.datasetId);
    return imported;
  });

  const imported = insertMany(responses);
  res.status(201).json({ imported, skipped: responses.length - imported });
});

router.get('/:datasetId/sample', (req, res) => {
  const sample = db.prepare('SELECT * FROM survey_responses WHERE dataset_id = ? ORDER BY RANDOM() LIMIT 10').all(req.params.datasetId);
  res.json({ sample });
});

module.exports = router;
