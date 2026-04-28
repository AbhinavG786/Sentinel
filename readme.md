# Sentinel — Backend

AI-powered observability and prompt firewall for production logs.

This repository contains the backend services for Sentinel: an event-driven platform that
ingests production logs, sanitizes sensitive data with a prompt firewall, uses an LLM
(Gemini) for analysis, and routes events through Kafka to microservices for storage,
audit, and notifications.

---

## Quick overview

- Ingest: `POST /firewall/api/ingest` — accepts raw logs or SDK calls.
- Sanitization: regex + knowledge-policy DB removes emails, IPs, API keys, tokens.
- AI analysis: Firewall calls Gemini to produce `{summary, root_cause, resolution, confidence}`.
- Event bus: Kafka topics carry traceId through the entire pipeline.

## Architecture (high level)

- API Gateway (port 3000): auth, rate-limiting, Redis cache, proxies to services.
- Services:
  - User Service (:4000) — user auth/CRUD
  - Incident Service (:4001) — dedupe, store incidents, update AI summaries
  - Firewall Service (:4002) — ingest, sanitize, produce `incident.created` and `policy.violation`
  - Audit Service (:4003) — consume audit events and policy logs
  - Notification Service (:4004) — Slack / Email notifications
- Infrastructure: Kafka (+Zookeeper), PostgreSQL, Redis

Trace IDs are generated early and propagated on every Kafka event.

## Kafka topics (selected)

- `incident.created` — produced by Firewall; consumed by Incident Service
- `incident.stored` — produced by Incident Service; consumed by Firewall AI
- `incident.analyzed` — produced after AI analysis; consumed by Incident Service
- `audit.event`, `alert.created`, `policy.violation` — audit/alerting flows

## Getting started (local development)

Prerequisites:

- Node 18+
- PostgreSQL
- Kafka + Zookeeper
- Redis
- Google Gemini API key (set `GOOGLE_GENAI_API_KEY`)

You can run services locally (developer mode) or with Docker Compose.

1. Install dependencies

```bash
cd d:\\Sentinel
npm install

# Build shared utilities first
cd packages/shared-utils
npm install
npm run build
```

2. Configure environment

Copy `.env.example` -> `.env` and set:

- `DATABASE_URL` (Postgres)
- `JWT_SECRET`
- `REDIS_URL`
- `KAFKA_BROKER`
- `GOOGLE_GENAI_API_KEY`
- `RESEND_API_KEY` (optional)
- `EMAIL_FROM` (notification emails)
- `SLACK_WEBHOOK_URL` (optional)

3. Run migrations & seeds

```bash
npx knex migrate:latest --knexfile knexfile.root.ts
npx knex seed:run --knexfile knexfile.root.ts
```

4. Start services (examples)

Run all services with Docker Compose (recommended for full infra):

```bash
docker compose up --build
```

Or run individual services for development:

```bash
# API Gateway
cd src/gateway && npx ts-node src/index.ts

# Firewall Service
cd src/services/firewall-service && npx ts-node src/server.ts

# Incident Service
cd src/services/incident-service && npx ts-node src/server.ts

# Audit Service
cd src/services/audit-service && npx ts-node src/server.ts

# Notification Service
cd src/services/notification-service && npx ts-node src/server.ts
```

## Quick smoke test

1. Register a user & obtain JWT

```bash
curl -X POST http://localhost:3000/users/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

2. Ingest a log (triggers pipeline)

```bash
curl -X POST http://localhost:3000/firewall/api/ingest \
	-H "Content-Type: application/json" \
	-d '{"logs": {"source":"payment-service","severity":"high","message":"Error: connection refused to DB at 192.168.1.100; user admin@company.com; token=abc123"}}'
```

Wait a few seconds and then query incidents:

```bash
curl http://localhost:3000/incidents
```

You should see a sanitized snippet in the incident and an `ai_summary` field populated after analysis.

## Developer notes & important files

- Shared utilities: [packages/shared-utils](packages/shared-utils)
- SDK (client): [packages/sentinel-sdk](packages/sentinel-sdk)
- Gateway: `src/gateway` — proxy routes and middleware
- Services: `src/services/*` — each microservice has its own package.json and tsconfig
- Knex root config: `knexfile.root.ts`
- Migrations: `src/packages/shared-utils/db/migrations` (see repo tree)

---
