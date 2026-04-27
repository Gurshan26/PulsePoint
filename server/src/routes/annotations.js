const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

router.get('/:datasetId', (req, res) => {
  const annotations = db.prepare('SELECT * FROM annotations WHERE dataset_id = ? ORDER BY date').all(req.params.datasetId);
  res.json({ annotations });
});

router.post('/:datasetId', (req, res) => {
  const { date, label, description, metric } = req.body;
  if (!date || !label?.trim()) return res.status(400).json({ error: 'date and label required' });

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO annotations (id, dataset_id, date, label, description, metric) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.params.datasetId, date, label.trim(), description || null, metric || 'all');
  res.status(201).json({ annotation: db.prepare('SELECT * FROM annotations WHERE id = ?').get(id) });
});

router.delete('/:datasetId/:annotationId', (req, res) => {
  db.prepare('DELETE FROM annotations WHERE id = ? AND dataset_id = ?').run(req.params.annotationId, req.params.datasetId);
  res.json({ success: true });
});

module.exports = router;
