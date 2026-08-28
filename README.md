# Company Microservices

Arsitektur microservices untuk perusahaan dengan database PostgreSQL, Redis, dan Docker.

## Services

- **API Gateway** (Port 4000): Entry point, proxy ke services lain
- **Auth Service** (Port 3001): Authentication dan authorization
- **Users Service** (Port 3002): Manajemen users
- **Products Service** (Port 3003): Manajemen products
- **Orders Service** (Port 3004): Manajemen orders

## Teknologi

- Node.js + Express
- PostgreSQL
- Redis
- Docker & Docker Compose

## Setup

1. Install Docker dan Docker Compose
2. Clone atau buat folder `company-microservices`
3. Jalankan:
   ```bash
   docker-compose up --build
   ```
4. Akses API Gateway di `http://localhost:4000`

## API Endpoints

### Auth
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login dan dapatkan JWT token

### Users
- `GET /users/:id` - Get user by ID (butuh auth)

### Products
- `GET /products` - List semua products
- `POST /products` - Tambah product baru (butuh auth admin)

### Orders
- `GET /orders` - List orders (butuh auth)
- `POST /orders` - Buat order baru (butuh auth)

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret untuk JWT
- `REDIS_URL`: Redis connection string

## Development

Untuk development lokal tanpa Docker:
1. Install PostgreSQL dan Redis
2. Buat database `company_db`
3. Set environment variables
4. Jalankan setiap service: `npm start` di folder masing-masing

## Testing

Gunakan tools seperti Postman atau curl untuk test API.

Contoh register:
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

Contoh login:
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

Gunakan token dari login untuk request yang butuh auth.
