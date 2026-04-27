const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { clusterThemes, identifyPriorities, generateSummary } = require('../services/themeCluster');
const { calculateNPS, calculateCSAT, calculateCES } = require('../services/npsCalc');

const router = express.Router();

router.get('/:datasetId', (req, res) => {
  const insights = db
    .prepare(`
      SELECT * FROM ai_insights
      WHERE dataset_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `)
    .all(req.params.datasetId)
    .map((row) => {
      try {
        return { ...row, parsed: JSON.parse(row.content) };
      } catch {
        return row;
      }
    });
  res.json({ insights });
});

router.post('/:datasetId/generate', async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const { type = 'all', period = 'Last 90 days' } = req.body;

    const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(datasetId);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    const totalResponses = db.prepare('SELECT COUNT(*) AS c FROM survey_responses WHERE dataset_id = ?').get(datasetId).c;
    const allThemes = db
      .prepare("SELECT themes FROM survey_responses WHERE dataset_id = ? AND themes != '[]'")
      .all(datasetId)
      .flatMap((row) => {
        try {
          return JSON.parse(row.themes);
        } catch {
          return [];
        }
      });

    const sentimentCounts = db
      .prepare(`
        SELECT sentiment, COUNT(*) AS count
        FROM survey_responses
        WHERE dataset_id = ? AND sentiment IS NOT NULL
        GROUP BY sentiment
      `)
      .all(datasetId);
    const totalSentiment = sentimentCounts.reduce((sum, row) => sum + row.count, 0);
    const countFor = (sentiment) => sentimentCounts.find((row) => row.sentiment === sentiment)?.count || 0;
    const sentimentBreakdown = {
      negativePct: totalSentiment > 0 ? Math.round((countFor('negative') / totalSentiment) * 100) : 0,
      positivePct: totalSentiment > 0 ? Math.round((countFor('positive') / totalSentiment) * 100) : 0
    };

    const npsScores = db.prepare('SELECT nps_score FROM survey_responses WHERE dataset_id = ? AND nps_score IS NOT NULL').all(datasetId).map((r) => r.nps_score);
    const csatScores = db.prepare('SELECT csat_score FROM survey_responses WHERE dataset_id = ? AND csat_score IS NOT NULL').all(datasetId).map((r) => r.csat_score);
    const cesScores = db.prepare('SELECT ces_score FROM survey_responses WHERE dataset_id = ? AND ces_score IS NOT NULL').all(datasetId).map((r) => r.ces_score);
    const nps = calculateNPS(npsScores);
    const csat = calculateCSAT(csatScores);
    const ces = calculateCES(cesScores);

    const uniqueThemes = [...new Set(allThemes)].slice(0, 15);
    const results = {};
    const insert = db.prepare('INSERT INTO ai_insights (id, dataset_id, period, type, content) VALUES (?, ?, ?, ?, ?)');

    if (type === 'all' || type === 'themes') {
      results.themes = await clusterThemes(allThemes);
      insert.run(crypto.randomUUID(), datasetId, period, 'themes', JSON.stringify(results.themes));
    }
    if (type === 'all' || type === 'priorities') {
      results.priorities = await identifyPriorities({ nps, csat, ces, sentimentBreakdown, topThemes: uniqueThemes, mainComplaints: [] });
      insert.run(crypto.randomUUID(), datasetId, period, 'priorities', JSON.stringify(results.priorities));
    }
    if (type === 'all' || type === 'summary') {
      results.summary = await generateSummary({
        name: dataset.name,
        period,
        totalResponses,
        nps,
        csat,
        ces,
        sentimentBreakdown,
        issues: results.priorities?.issues || [],
        topThemes: uniqueThemes
      });
      insert.run(crypto.randomUUID(), datasetId, period, 'summary', JSON.stringify(results.summary));
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
