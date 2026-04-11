# Sentinel — Remaining Issues & Implementation Plan

> **Updated:** Issues you've already fixed have been removed. This only shows what's left.

## ✅ Fixes Verified & Confirmed

| # | Fix | Status |
|---|---|---|
| C1 | `moduleResolution: "node"` in all 8 tsconfig files | ✅ Correct |
| C2 | `@shared/utils` moved to `dependencies` in user-service & incident-service | ✅ Correct |
| C3 | Duplicate producer removed in incident-service [producer.ts](file:///d:/Sentinel/src/services/audit-service/src/kafka/producer.ts) | ✅ Correct |
| C4 | Kafka message key changed from string literal to variable | ✅ Correct |
| C6 | Gateway service registry ports corrected | ✅ Correct |
| M2 | Express server added to incident-service | ✅ Correct |
| M3 | `express.json()` added to user-service | ✅ Correct |
| M6 | Redis event listeners moved inside init block | ✅ Correct |
| I6 | `knexConfig` changed from default to named export | ⚠️ Partial (see N1 below) |
| Q1 | Deprecated `@types/*` packages removed | ✅ Correct |
| — | `declaration: true` added to all service tsconfigs | ✅ Good addition |

---

## 🔴 New Issues Introduced by Fixes

#### N1. [db/knex.ts](file:///d:/Sentinel/packages/shared-utils/src/db/knex.ts) Still Uses Default Import — Will Break at Runtime

**File:** [knex.ts](file:///d:/Sentinel/packages/shared-utils/src/db/knex.ts#L2)

You changed [knexfile.ts](file:///d:/Sentinel/packages/shared-utils/src/db/knexfile.ts) from `export default knexConfig` to `export const knexConfig`, but [db/knex.ts](file:///d:/Sentinel/packages/shared-utils/src/db/knex.ts) line 2 still does:

```typescript
import knexConfig from "./knexfile";  // ← default import, but there's no default export anymore
```

**Fix:** Change to a named import:
```typescript
import { knexConfig } from "./knexfile";
```

---

#### N2. Firewall AI Worker Now Points to Wrong Port

**File:** [firewall consumer.ts](file:///d:/Sentinel/src/services/firewall-service/src/kafka/consumer.ts#L28)

You changed the URL from `localhost:4002` to `localhost:4004`, but port 4004 is the **notification-service**, not the AI analyzer. The `/api/analyze` endpoint lives on the **firewall-service itself** at port 4002.

The original issue was that the consumer calls its own service via HTTP (a self-loop). Two options:

**Option A (Recommended):** Call the analyzer function directly — no HTTP needed:
```typescript
import { analyzeIncidentDirect } from "../ai/analyzer";
// ...
const analysis = await analyzeIncidentDirect(incident.sanitizedSnippet);
```
This requires refactoring [analyzer.ts](file:///d:/Sentinel/src/services/firewall-service/src/ai/analyzer.ts) to export a non-Express function.

**Option B:** Revert to `http://localhost:4002/api/analyze` and in Docker use `http://firewall-service:4002/api/analyze`.

---

#### N3. Incident Service Routes Not Mounted on Express App

**File:** [incident-service/server.ts](file:///d:/Sentinel/src/services/incident-service/src/server.ts)

You added `const app = express()` and `app.listen(4001)`, but never mounted the incident routes:

```typescript
// Missing this line:
import incidentRoutes from "./routes/incidents.route";
app.use("/incidents", incidentRoutes);
```

Without this, the gateway's proxied requests to `http://localhost:4001/incidents` will get 404s.

---

#### N4. Unused `kafka` Import in `incident-service/producer.ts`

**File:** [incident-service/producer.ts](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts#L1)

Line 1 still has `import {kafka} from "@shared/utils"` which is no longer used since the producer is now imported from `./kafka`. Remove this dead import.

---

#### N5. [initProducer()](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts#5-9) in [producer.ts](file:///d:/Sentinel/src/services/audit-service/src/kafka/producer.ts) Is Redundant

**File:** [incident-service/producer.ts](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts#L5-8)

The [initProducer()](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts#5-9) function calls `producer.connect()`, but [kafka.ts](file:///d:/Sentinel/packages/shared-utils/src/kafka.ts) already has [initKafka()](file:///d:/Sentinel/src/services/notification-service/src/kafka/kafka.ts#9-15) which connects the same producer. [initProducer()](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts#5-9) is never called and should be removed.

---

## 🟠 Previously Identified Issues Still Remaining

#### M1. Firewall AI Worker Calls Itself via HTTP (Self-Loop)

**File:** [firewall-service/kafka/consumer.ts](file:///d:/Sentinel/src/services/firewall-service/src/kafka/consumer.ts#L27-28)

Same core issue as before (now made worse by N2). The Kafka consumer within the firewall service makes an HTTP call to analyze incidents. In Docker, `localhost` won't work because the consumer runs inside the same container.

**Recommended fix:** Refactor [analyzer.ts](file:///d:/Sentinel/src/services/firewall-service/src/ai/analyzer.ts) to separate the core logic from the Express handler:

```typescript
// ai/analyzer.ts — add this function
export async function analyzeIncidentDirect(sanitizedSnippet: string) {
  const prompt = `...`;  // same prompt as before
  const response = await ai.models.generateContent({ ... });
  return JSON.parse(response.text);
}

// The Express handler can then call this function:
const analyzeIncident = async (req, res) => {
  const result = await analyzeIncidentDirect(req.body.incident);
  res.json({ result });
};
```

Then in the Kafka consumer, import and call `analyzeIncidentDirect()` directly.

---

#### M4. `incident.created` Topic Schema Conflict

**Files:** [firewall producer.ts](file:///d:/Sentinel/src/services/firewall-service/src/kafka/producer.ts) and [incident-service producer.ts](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts)

Both services produce to the `incident.created` topic, but with **different schemas**:
- Firewall produces [IncidentCreatedEvent](file:///d:/Sentinel/packages/shared-utils/src/types.ts#1-11) (has `tempId`, `sanitizedSnippet`)
- REST API controller produces raw [Incident](file:///d:/Sentinel/src/services/incident-service/src/helpers/incidents.helpers.ts#3-16) object (has `title`, `description`)

The consumer expects [IncidentCreatedEvent](file:///d:/Sentinel/packages/shared-utils/src/types.ts#1-11). Events from the REST API will cause parse failures.

**Fix options:**
1. Remove [sendIncidentEvent](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts#10-25) from the REST controller entirely — incidents from the REST API are already saved to DB, they don't need the Kafka pipeline
2. Or use a different topic name like `incident.manual_created`

---

#### M5. `alert.created` Fires Unconditionally

**File:** [incident-service/kafka/consumer.ts](file:///d:/Sentinel/src/services/incident-service/src/kafka/consumer.ts#L58-71)

Every analyzed incident produces an `alert.created` event with `severity: "high"` regardless of actual severity.

**Fix:** Make it conditional:
```typescript
if (confidence > 0.7 && ["high", "critical"].includes(updatedIncident.severity)) {
  await producer.send({ topic: "alert.created", ... });
}
```

---

#### M7. Gateway Forwards Raw `req.headers` to Services

**Files:** All gateway route files

Forwarding `host`, `content-length`, etc. can cause request failures. 

**Fix:** Sanitize headers before forwarding:
```typescript
const { host, 'content-length': _, ...cleanHeaders } = req.headers;
const response = await axios.get(url, { headers: cleanHeaders });
```

---

#### M8. Firewall Routes File Typo

**File:** [anayzer.routes.ts](file:///d:/Sentinel/src/services/firewall-service/src/routes/anayzer.routes.ts) → should be `analyzer.routes.ts`

Also update the import in [server.ts](file:///d:/Sentinel/src/services/firewall-service/src/server.ts#L3).

---

## 🟡 Incomplete Implementations Still Remaining

| # | Issue | What to Do |
|---|---|---|
| I1 | Firewall ingest controller skips validation | Add input validation (check `logs` exists, has required fields) before producing |
| I2 | [sanitizeLogs()](file:///d:/Sentinel/packages/shared-utils/src/sanitizeLogs.ts#24-109) — system events & alerts commented out | Un-comment and implement when ready |
| I3 | No `ingest.analyzed` or policy violation events | Add Kafka events for policy violations detected during sanitization |
| I4 | Audit & Notification services have no HTTP server | Add minimal Express + health endpoint on ports 4003/4004 |
| I5 | Incident-service auth middleware & rate limiter unused | Mount them on the new Express app when appropriate |
| C5 | [sanitizeLogs()](file:///d:/Sentinel/packages/shared-utils/src/sanitizeLogs.ts#24-109) return type mismatch | [sanitizeLogs(db, log.message)](file:///d:/Sentinel/packages/shared-utils/src/sanitizeLogs.ts#24-109) should pass full `log` object; return is an object but `sanitizedSnippet` expects a string |

---

## 🟢 Minor Issues Still Remaining

| # | Issue | Location |
|---|---|---|
| Q2 | Auth middleware duplicated across gateway, incident-service, user-service | Move to `@shared/utils` |
| Q3 | `concurrently` used in root scripts but not installed | `npm install -D concurrently` |
| Q4 | Hardcoded email `bengupta786@gmail.com` as sender | [email.ts](file:///d:/Sentinel/src/services/notification-service/src/integrations/email.ts) — use env var |
| Q5 | Seed file uses plaintext password hashes | [01_users.ts](file:///d:/Sentinel/packages/shared-utils/src/db/seeds/01_users.ts) — use bcrypt |
| Q8 | Empty [producer.ts](file:///d:/Sentinel/src/services/audit-service/src/kafka/producer.ts) files in audit & notification services | Delete them |
| Q9 | Lots of commented-out code in rate limiter | Clean up [rateLimiter.ts](file:///d:/Sentinel/src/gateway/src/middlewares/rateLimiter.ts) |

---

## Updated Implementation Plan (Remaining Work)

### ~~Phase 1: Fix TypeScript Config~~ ✅ Done

### ~~Phase 2: Fix Shared-Utils Foundation~~ ✅ Mostly Done
- [ ] Fix [db/knex.ts](file:///d:/Sentinel/packages/shared-utils/src/db/knex.ts) — change to named import `import { knexConfig } from "./knexfile"` **(N1)**

### Phase 3: Fix Individual Services

**Firewall Service:**
1. Refactor [analyzer.ts](file:///d:/Sentinel/src/services/firewall-service/src/ai/analyzer.ts) — extract core function, call directly from Kafka consumer instead of HTTP **(M1/N2)**
2. Fix [sanitizeLogs()](file:///d:/Sentinel/packages/shared-utils/src/sanitizeLogs.ts#24-109) call — pass full log object, handle return type **(C5)**
3. Rename [anayzer.routes.ts](file:///d:/Sentinel/src/services/firewall-service/src/routes/anayzer.routes.ts) → `analyzer.routes.ts` **(M8)**
4. Add input validation in ingest controller **(I1)**

**Incident Service:**
1. Mount routes on the Express app **(N3)**
2. Remove unused `kafka` import and [initProducer()](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts#5-9) from [producer.ts](file:///d:/Sentinel/src/services/audit-service/src/kafka/producer.ts) **(N4/N5)**
3. Decide: remove [sendIncidentEvent](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts#10-25) or use different topic **(M4)**
4. Make `alert.created` conditional **(M5)**
5. Wire up auth middleware and rate limiter **(I5)**

**Audit Service:**
1. Add Express server with health endpoint on port 4003 **(I4)**

**Notification Service:**
1. Add Express server with health endpoint on port 4004 **(I4)**
2. Move hardcoded email to env var **(Q4)**

### Phase 4: Fix Gateway
1. Sanitize forwarded headers **(M7)**
2. Move auth middleware to `@shared/utils` **(Q2)**

### Phase 5: Complete Event Flow
1. Un-comment system events in [sanitizeLogs()](file:///d:/Sentinel/packages/shared-utils/src/sanitizeLogs.ts#24-109) **(I2)**
2. Add policy violation Kafka events **(I3)**

### Phase 6: Production Hardening
1. Add health-check endpoints to all services
2. Graceful shutdown for Kafka/DB in all services
3. Install `concurrently` **(Q3)**
4. Delete empty [producer.ts](file:///d:/Sentinel/src/services/audit-service/src/kafka/producer.ts) files **(Q8)**
5. Clean up commented-out code **(Q9)**
6. Use bcrypt in seed file **(Q5)**
7. Add `dist/` to [.gitignore](file:///d:/Sentinel/.gitignore)
