const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();
const VALID_METRICS = ['nps', 'csat', 'ces', 'response_volume', 'negative_rate'];

router.get('/:datasetId', (req, res) => {
  const alerts = db.prepare('SELECT * FROM alert_thresholds WHERE dataset_id = ? ORDER BY created_at DESC').all(req.params.datasetId);
  res.json({ alerts });
});

router.post('/:datasetId', (req, res) => {
  const { metric, operator, threshold, severity, label } = req.body;
  if (!VALID_METRICS.includes(metric)) return res.status(400).json({ error: 'Invalid metric' });
  if (!['below', 'above'].includes(operator)) return res.status(400).json({ error: 'Invalid operator' });
  if (threshold === undefined || Number.isNaN(Number(threshold))) return res.status(400).json({ error: 'Invalid threshold' });
  if (!label?.trim()) return res.status(400).json({ error: 'Label required' });

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO alert_thresholds (id, dataset_id, metric, operator, threshold, severity, label) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.params.datasetId, metric, operator, Number(threshold), severity || 'warning', label.trim());
  res.status(201).json({ alert: db.prepare('SELECT * FROM alert_thresholds WHERE id = ?').get(id) });
});

router.patch('/:datasetId/:alertId', (req, res) => {
  db.prepare('UPDATE alert_thresholds SET active = ? WHERE id = ? AND dataset_id = ?')
    .run(req.body.active ? 1 : 0, req.params.alertId, req.params.datasetId);
  res.json({ success: true });
});

router.delete('/:datasetId/:alertId', (req, res) => {
  db.prepare('DELETE FROM alert_thresholds WHERE id = ? AND dataset_id = ?').run(req.params.alertId, req.params.datasetId);
  res.json({ success: true });
});

module.exports = router;
