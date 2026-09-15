'use strict';
const _ = require('lodash');
const { z } = require('zod');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ChargeSchema = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().length(3),
  customerId: z.string().uuid(),
  metadata: z.record(z.string()).optional(),
});

function registerPaymentRoutes(router) {
  router.post('/charges', async (req, res) => {
    const parsed = ChargeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ error: parsed.error.flatten() });
    }
    const charge = _.defaults(parsed.data, { metadata: {} });
    const { rows } = await pool.query(
      'INSERT INTO charges (amount_cents, currency, customer_id, metadata) VALUES ($1,$2,$3,$4) RETURNING id',
      [charge.amountCents, charge.currency, charge.customerId, charge.metadata]
    );
    res.status(201).json({ id: rows[0].id, status: 'pending' });
  });

  router.get('/charges/:id', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM charges WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    res.json(_.omit(rows[0], ['internal_ledger_ref']));
  });

  return router;
}

module.exports = { registerPaymentRoutes };
