'use strict';
const express = require('express');
const minimist = require('minimist');
require('dotenv').config();

const { registerPaymentRoutes } = require('./payments');
const { requireToken } = require('./auth');

const argv = minimist(process.argv.slice(2), {
  default: { port: 8080, host: '0.0.0.0' },
});

const app = express();
app.use(express.json({ limit: '1mb' }));
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.use('/v1/payments', requireToken, registerPaymentRoutes(express.Router()));

app.listen(argv.port, argv.host, () => {
  console.log(`payments-api listening on ${argv.host}:${argv.port}`);
});
