import crypto from 'crypto';

export function resetDb(db) {
  db.exec(`
    DELETE FROM ai_cache;
    DELETE FROM ai_insights;
    DELETE FROM alert_thresholds;
    DELETE FROM annotations;
    DELETE FROM survey_responses;
    DELETE FROM datasets;
  `);
}

export function seedDataset(db, datasetId = 'demo-cx') {
  db.prepare(`
    INSERT INTO datasets (id, name, org_name, description, industry, passcode, admin_passcode, response_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `).run(datasetId, 'Test CX Study', 'Test Org', 'Test dataset', 'General', 'view1234', 'admin1234');

  const insert = db.prepare(`
    INSERT INTO survey_responses
      (id, dataset_id, channel, touchpoint, segment, nps_score, csat_score, ces_score, verbatim, sentiment, themes, category_tags, date, ai_processed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const rows = [
    ['Phone', 'Customer Service', 'Retail', 10, 5, 2, 'Great and helpful service', 'positive', ['staff helpfulness'], '2026-04-01'],
    ['Phone', 'Customer Service', 'Retail', 9, 4, 2, 'Quick answer from the team', 'positive', ['speed'], '2026-04-02'],
    ['Online', 'Digital Banking', 'Business', 7, 3, 4, 'It was fine overall', 'neutral', ['general feedback'], '2026-04-08'],
    ['Online', 'Digital Banking', 'Business', 2, 2, 6, 'Portal was broken and slow', 'negative', ['digital experience'], '2026-04-10'],
    ['Branch', 'Branch Visit', 'Premium', 5, 2, 6, 'Waited too long at the branch', 'negative', ['wait times'], '2026-04-11']
  ];

  for (const row of rows) {
    insert.run(crypto.randomUUID(), datasetId, row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], JSON.stringify(row[8]), JSON.stringify(row[8]), row[9]);
  }

  db.prepare(`
    UPDATE datasets
    SET response_count = (SELECT COUNT(*) FROM survey_responses WHERE dataset_id = ?),
        date_range_start = (SELECT MIN(date) FROM survey_responses WHERE dataset_id = ?),
        date_range_end = (SELECT MAX(date) FROM survey_responses WHERE dataset_id = ?)
    WHERE id = ?
  `).run(datasetId, datasetId, datasetId, datasetId);

  db.prepare('INSERT INTO annotations (id, dataset_id, date, label, description, metric) VALUES (?, ?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), datasetId, '2026-04-08', 'Test annotation', 'Fixture note', 'all');
  db.prepare('INSERT INTO alert_thresholds (id, dataset_id, metric, operator, threshold, severity, label) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), datasetId, 'nps', 'below', 30, 'critical', 'NPS threshold');
}
