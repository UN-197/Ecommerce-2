const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3004;

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'orders-service' }));

app.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY id', [
      req.user.id,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/', authenticate, async (req, res) => {
  const { product_id, quantity } = req.body;
  if (
    !Number.isInteger(product_id) ||
    product_id <= 0 ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return res
      .status(400)
      .json({ error: 'product_id and quantity must be positive integers' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const product = await client.query(
      'SELECT id, stock FROM products WHERE id = $1 FOR UPDATE',
      [product_id]
    );
    if (!product.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.rows[0].stock < quantity) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Insufficient stock' });
    }
    await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
      quantity,
      product_id,
    ]);
    const result = await client.query(
      'INSERT INTO orders (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, product_id, quantity]
    );
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`orders-service listening on ${PORT}`)))
  .catch((err) => {
    console.error('Failed to init db', err);
    process.exit(1);
  });
