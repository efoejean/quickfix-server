export const readme = `
# QuickFix Server (NestJS + Prisma)


## Prereqs
- Node 20+
- Docker (for Postgres & Redis)


## Setup
```bash
git clone <repo>
cd server
cp .env.example .env
docker compose up -d
npm i
npx prisma generate
npx prisma db push
npm run dev
```
Docs: http://localhost:\$PORT/docs


## Stripe Webhooks
Expose localhost (e.g. \`stripe listen --forward-to localhost:4000/webhooks/stripe\`).


## Notes
- OTP stores a hashed code with TTL; swap the in-memory timeout for Redis if needed.
- Add geo-indexes (PostGIS) in Phase 2 for radius queries at scale; MVP can filter in SQL + haversine.
- Align responses with the Step 2 OpenAPI; add DTOs for all endpoints before prod.
`;