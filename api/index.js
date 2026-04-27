process.env.DB_PATH = process.env.DB_PATH || (process.env.VERCEL ? '/tmp/pulsepoint/pulsepoint.db' : undefined);

const app = require('../server/src/index');

module.exports = async function handler(req, res) {
  global.__pulsepointSeedPromise = global.__pulsepointSeedPromise || app.seed();
  await global.__pulsepointSeedPromise;
  return app(req, res);
};
