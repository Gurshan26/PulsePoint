const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { readBearer } = require('../auth');

const router = express.Router();

router.get('/', (req, res) => {
  const datasets = db
    .prepare(`
      SELECT id, name, org_name, description, industry, response_count, date_range_start, date_range_end, created_at
      FROM datasets
      ORDER BY created_at DESC
    `)
    .all();
  res.json({ datasets });
});

router.get('/:id', (req, res) => {
  const dataset = db
    .prepare(`
      SELECT id, name, org_name, description, industry, response_count, date_range_start, date_range_end, created_at, updated_at
      FROM datasets
      WHERE id = ?
    `)
    .get(req.params.id);

  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
  res.json({ dataset });
});

router.post('/', (req, res) => {
  const { name, org_name, description, industry, passcode, admin_passcode } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Dataset name required' });
  if (!admin_passcode || admin_passcode.length < 6) {
    return res.status(400).json({ error: 'Admin passcode must be at least 6 characters' });
  }

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO datasets (id, name, org_name, description, industry, passcode, admin_passcode)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), org_name || '', description || '', industry || 'General', passcode || 'view1234', admin_passcode);

  res.status(201).json({ dataset: db.prepare('SELECT * FROM datasets WHERE id = ?').get(id) });
});

router.patch('/:id', (req, res) => {
  const dataset = db.prepare('SELECT admin_passcode FROM datasets WHERE id = ?').get(req.params.id);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
  if (dataset.admin_passcode !== readBearer(req)) return res.status(403).json({ error: 'Unauthorized' });

  const allowed = ['name', 'org_name', 'description', 'industry'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });
  const clause = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
  db.prepare(`UPDATE datasets SET ${clause}, updated_at = datetime('now') WHERE id = ?`).run(...Object.values(updates), req.params.id);
  res.json({ success: true });
});

router.post('/:id/auth', (req, res) => {
  const { passcode } = req.body;
  if (!passcode) return res.status(400).json({ error: 'Passcode required' });

  const dataset = db.prepare('SELECT passcode, admin_passcode FROM datasets WHERE id = ?').get(req.params.id);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
  if (passcode === dataset.admin_passcode) return res.json({ authenticated: true, role: 'admin' });
  if (passcode === dataset.passcode) return res.json({ authenticated: true, role: 'viewer' });
  return res.status(403).json({ error: 'Invalid passcode' });
});

module.exports = router;
