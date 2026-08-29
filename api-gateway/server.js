const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 4000;

const routes = {
  '/auth': process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  '/users': process.env.USERS_SERVICE_URL || 'http://localhost:3002',
  '/products': process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003',
  '/orders': process.env.ORDERS_SERVICE_URL || 'http://localhost:3004',
};

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

for (const [prefix, target] of Object.entries(routes)) {
  app.use(
    prefix,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [`^${prefix}`]: '' },
    })
  );
}

app.listen(PORT, () => console.log(`api-gateway listening on ${PORT}`));
