require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/datasets', require('./routes/datasets'));
app.use('/api/responses', require('./routes/responses'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/trends', require('./routes/trends'));
app.use('/api/verbatims', require('./routes/verbatims'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/annotations', require('./routes/annotations'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/export', require('./routes/export'));

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../client/dist/index.html')));
}

app.use(require('./middleware/errorHandler'));

function isoDateDaysAgo(days) {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
}

async function seed() {
  const db = require('./db');
  const existing = db.prepare('SELECT COUNT(*) AS c FROM datasets').get();
  if (existing.c > 0) return;

  const datasetId = 'demo-cx';
  db.prepare(`
    INSERT INTO datasets (id, name, org_name, description, industry, passcode, admin_passcode, response_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    datasetId,
    'Retail Banking CX Study',
    'Apex Financial',
    'Customer satisfaction data from branch, digital, phone, and card support touchpoints.',
    'Financial Services',
    'pulse2024',
    'admin2024',
    0
  );

  const insert = db.prepare(`
    INSERT INTO survey_responses
      (id, dataset_id, channel, touchpoint, segment, nps_score, csat_score, ces_score, verbatim, sentiment, themes, category_tags, region, date, ai_processed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const channels = ['Branch', 'Mobile App', 'Phone', 'Online', 'ATM'];
  const touchpoints = ['Account Opening', 'Loan Application', 'Customer Service', 'Digital Banking', 'Branch Visit', 'Card Services'];
  const segments = ['Retail', 'Business', 'Premium', 'Youth'];
  const regions = ['VIC', 'NSW', 'QLD', 'WA', 'SA'];
  const positives = [
    ['Staff were incredibly helpful and sorted my issue straight away.', ['staff helpfulness', 'speed']],
    ['The mobile app is intuitive and fast, exactly what I needed.', ['digital experience', 'speed']],
    ['Great experience at the branch, very quick service.', ['branch visit', 'staff helpfulness']],
    ['Really impressed with how easy it was to open a new account.', ['account onboarding', 'ease of use']],
    ['The consultant walked me through everything clearly.', ['staff helpfulness', 'clarity']],
    ['Loan process was much smoother than expected.', ['loan application', 'process clarity']]
  ];
  const negatives = [
    ['Waited 25 minutes on hold just to be transferred again.', ['wait times', 'service quality']],
    ['The online portal crashed three times and it was incredibly frustrating.', ['digital experience', 'portal reliability']],
    ["Was charged a fee I didn't know existed. No one told me.", ['billing issues', 'fee transparency']],
    ['Branch closed early without notice. Completely inconvenient.', ['branch visit', 'communication']],
    ['My issue took four separate calls to resolve. Unacceptable.', ['repeat contacts', 'resolution ownership']],
    ['The app keeps logging me out mid-transaction.', ['digital experience', 'app reliability']],
    ["Staff didn't know the answer and just transferred me around.", ['staff training', 'handoffs']]
  ];
  const neutrals = [
    ['It was fine. Nothing special, nothing bad.', ['general feedback']],
    ['Process was standard and met expectations.', ['general feedback']],
    ['Took a while but eventually resolved.', ['resolution time']],
    ['Average experience overall.', ['general feedback']]
  ];

  const insertMany = db.transaction(() => {
    for (let i = 0; i < 520; i++) {
      const dayOffset = Math.floor(Math.random() * 365);
      const date = isoDateDaysAgo(dayOffset);
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const touchpoint = touchpoints[Math.floor(Math.random() * touchpoints.length)];
      const segment = segments[Math.floor(Math.random() * segments.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const r = Math.random();

      let nps;
      let csat;
      let ces;
      let entry;
      let sentiment;
      if (r < 0.37) {
        nps = Math.floor(Math.random() * 7);
        csat = Math.round(((Math.random() * 1.5) + 1) * 2) / 2;
        ces = Math.round(((Math.random() * 2) + 5) * 2) / 2;
        entry = negatives[Math.floor(Math.random() * negatives.length)];
        sentiment = 'negative';
      } else if (r < 0.62) {
        nps = Math.floor(Math.random() * 2) + 7;
        csat = Math.round(((Math.random() * 1) + 3) * 2) / 2;
        ces = Math.round(((Math.random() * 2) + 3) * 2) / 2;
        entry = neutrals[Math.floor(Math.random() * neutrals.length)];
        sentiment = 'neutral';
      } else {
        nps = Math.floor(Math.random() * 2) + 9;
        csat = Math.round(((Math.random() * 1) + 4) * 2) / 2;
        ces = Math.round(((Math.random() * 1.5) + 1) * 2) / 2;
        entry = positives[Math.floor(Math.random() * positives.length)];
        sentiment = 'positive';
      }

      insert.run(
        crypto.randomUUID(),
        datasetId,
        channel,
        touchpoint,
        segment,
        nps,
        csat,
        ces,
        entry[0],
        sentiment,
        JSON.stringify(entry[1]),
        JSON.stringify(entry[1]),
        region,
        date,
        1
      );
    }

    db.prepare(`
      UPDATE datasets
      SET response_count = (SELECT COUNT(*) FROM survey_responses WHERE dataset_id = ?),
          date_range_start = (SELECT MIN(date) FROM survey_responses WHERE dataset_id = ?),
          date_range_end = (SELECT MAX(date) FROM survey_responses WHERE dataset_id = ?)
      WHERE id = ?
    `).run(datasetId, datasetId, datasetId, datasetId);
  });

  insertMany();

  db.prepare('INSERT INTO annotations (id, dataset_id, date, label, description, metric) VALUES (?, ?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), datasetId, isoDateDaysAgo(72), 'New app version launched', 'v3.2 released with redesigned navigation', 'all');
  db.prepare('INSERT INTO annotations (id, dataset_id, date, label, description, metric) VALUES (?, ?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), datasetId, isoDateDaysAgo(32), 'Phone wait-time initiative', 'Added callback handling and 12 support agents', 'nps');
  db.prepare('INSERT INTO alert_thresholds (id, dataset_id, metric, operator, threshold, severity, label) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), datasetId, 'nps', 'below', 20, 'critical', 'NPS below 20: urgent review needed');

  console.log('Demo data seeded: 520 responses, Retail Banking CX Study, passcode pulse2024, admin admin2024');
}

if (require.main === module) {
  seed().then(() => {
    app.listen(PORT, () => {
      console.log(`PulsePoint running on :${PORT}`);
      if (!process.env.GEMINI_API_KEY) console.warn('GEMINI_API_KEY not set: using mock AI');
    });
  });
}

module.exports = app;
module.exports.seed = seed;
