const db = require('./db');

function readBearer(req) {
  return (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
}

function requireAdmin(req, res, next) {
  const dataset = db.prepare('SELECT admin_passcode FROM datasets WHERE id = ?').get(req.params.id || req.params.datasetId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
  if (dataset.admin_passcode !== readBearer(req)) return res.status(403).json({ error: 'Unauthorized' });
  return next();
}

module.exports = { readBearer, requireAdmin };
