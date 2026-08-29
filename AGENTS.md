# AGENTS

## Project overview
This repository contains a small Node.js microservices application for an ecommerce platform. The services are independently runnable and are all wired through Docker Compose for local orchestration.

## Service layout
- api-gateway: exposes public endpoints and proxies requests to internal services
- auth-service: registers users and issues JWT tokens
- users-service: reads user records
- products-service: manages product catalog entries
- orders-service: manages order creation and stock reductions

## Local workflow
1. Copy `.env.example` to `.env` and fill values for local development.
2. Install dependencies in each service folder with `npm install`.
3. Run the stack via `docker-compose up --build`.
4. Use `npm test` inside each service to verify route-level behavior.

## Security expectations
- Never commit hardcoded credentials or JWT secrets.
- Use environment variables for service connection strings and secrets.
- Remove debug logging before production use.
