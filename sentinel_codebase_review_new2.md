# Sentinel — Remaining Issues (Round 3)

> All critical and major issues from rounds 1 & 2 are fixed. Below is what's left.

## ✅ Fixes Verified This Round

| # | Fix | Status |
|---|---|---|
| N1 | [db/knex.ts](file:///d:/Sentinel/packages/shared-utils/src/db/knex.ts) changed to named import `{ knexConfig }` | ✅ |
| N2/M1 | AI analyzer refactored to direct function call, no more HTTP self-loop | ✅ |
| N3 | Incident routes mounted on Express app | ✅ |
| N4/N5 | Dead `kafka` import and `initProducer()` removed from incident producer | ✅ |
| M4 | REST API now produces to `incident.manual_created` (separate topic) | ✅ |
| M5 | `alert.created` conditional on `confidence > 0.7` + high/critical severity | ✅ |
| M7 | Headers sanitized (stripped `host`, `content-length`) in all gateway routes | ✅ |
| M8 | [anayzer.routes.ts](file:///d:/Sentinel/src/services/firewall-service/src/routes/anayzer.routes.ts) renamed to [analyzer.routes.ts](file:///d:/Sentinel/src/services/firewall-service/src/routes/analyzer.routes.ts) | ✅ |
| C5 | [sanitizeLogs()](file:///d:/Sentinel/packages/shared-utils/src/sanitizeLogs.ts#24-109) now receives full log object and returns `string` | ✅ |
| Q2 | Auth middleware created in `@shared/utils/src/authMiddleware.ts` | ⚠️ Partial (see W1) |

---

## 🟠 Issues Still Needing Fixes

#### W1. Auth Middleware Import Path Will Fail at Runtime

**Files:** [incidents.routes.ts](file:///d:/Sentinel/src/gateway/src/routes/incidents.routes.ts#L5), [users.routes.ts](file:///d:/Sentinel/src/gateway/src/routes/users.routes.ts#L4)

The gateway imports auth middleware as:
```typescript
import { authenticate, authorize } from "@shared/utils/src/authMiddleware";
```

This is a **deep path import** pointing at the TypeScript source file inside `src/`. In a compiled/npm workspace setup, this path resolves to the raw [.ts](file:///d:/Sentinel/knexfile.root.ts) file, not the compiled [.js](file:///d:/Sentinel/node_modules/ts-node/dist/tsconfigs.js) output. It will break in production and may cause issues with `ts-node` depending on resolution mode.

**Two things to fix:**

1. **Re-export from [index.ts](file:///d:/Sentinel/src/gateway/src/index.ts)** — Add to [shared-utils/src/index.ts](file:///d:/Sentinel/packages/shared-utils/src/index.ts):
   ```typescript
   export * from "./authMiddleware";
   ```

2. **Change import path in gateway** to use the barrel export:
   ```typescript
   import { authenticate, authorize } from "@shared/utils";
   ```

Also: shared-utils [package.json](file:///d:/Sentinel/package.json) is missing `express` and `jsonwebtoken` as dependencies — the auth middleware imports both. Add them:
```json
"dependencies": {
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  ...
}
```
And add the type packages to devDependencies:
```json
"devDependencies": {
  "@types/express": "^5.0.5",
  "@types/jsonwebtoken": "^9.0.10",
  ...
}
```

---

#### W2. `incident.manual_created` Kafka Key Is a Static String

**File:** [incident-service/producer.ts](file:///d:/Sentinel/src/services/incident-service/src/kafka/producer.ts#L10)

```typescript
key: "incident.manual_created",  // ← static string, not useful for partitioning
```

The key should be a unique identifier like the incident ID so Kafka can partition effectively:
```typescript
key: incident.id || "unknown",
```

---

#### W3. Firewall `/api/analyze` Route Now Broken

**File:** [firewall-service/server.ts](file:///d:/Sentinel/src/services/firewall-service/src/server.ts)

You refactored [analyzeIncident](file:///d:/Sentinel/src/services/firewall-service/src/ai/analyzer.ts#6-71) to be a plain function (no longer an Express handler), but the route `app.use("/api", analyzerRoutes)` still mounts it. The route file imports and uses [analyzeIncident](file:///d:/Sentinel/src/services/firewall-service/src/ai/analyzer.ts#6-71) as a route handler — this will fail since the function signature changed from [(req, res)](file:///d:/Sentinel/packages/shared-utils/src/db/migrations/20251030175223_create_audit_logs.ts#4-17) to [(incident)](file:///d:/Sentinel/packages/shared-utils/src/db/migrations/20251030175223_create_audit_logs.ts#4-17).

**Two options:**

**Option A:** Remove the analyzer route entirely (since AI is now called directly via Kafka consumer). Delete the route file and remove from server.ts:
```diff
-import analyzerRoutes from "./routes/analyzer.routes";
-app.use("/api", analyzerRoutes);
```

**Option B:** Keep the HTTP endpoint for testing/debugging by creating a thin Express wrapper:
```typescript
// routes/analyzer.routes.ts
import { Router } from "express";
import { analyzeIncident } from "../ai/analyzer";

const router = Router();
router.post("/analyze", async (req, res) => {
  try {
    const result = await analyzeIncident(req.body.incident);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;
```

---

#### W4. Firewall Kafka Consumer Not Started

**File:** [firewall-service/server.ts](file:///d:/Sentinel/src/services/firewall-service/src/server.ts)

The [aiAnalyzer()](file:///d:/Sentinel/src/services/firewall-service/src/kafka/consumer.ts#9-61) function (Kafka consumer) is defined but never called from [server.ts](file:///d:/Sentinel/src/services/user-service/src/server.ts). It only calls [initKafka()](file:///d:/Sentinel/src/services/notification-service/src/kafka/kafka.ts#9-15) but not [aiAnalyzer()](file:///d:/Sentinel/src/services/firewall-service/src/kafka/consumer.ts#9-61).

**Fix:** Add to [server.ts](file:///d:/Sentinel/src/services/user-service/src/server.ts):
```typescript
import { aiAnalyzer } from "./kafka/consumer";

app.listen(4002, async () => {
  console.log("Knowledge Firewall service running on 4002");
  await initKafka();
  await aiAnalyzer();  // ← start the AI Kafka consumer
});
```

---

## 🟡 Incomplete Implementations

| # | Issue | What to Do |
|---|---|---|
| I1 | Firewall ingest controller has no input validation | Validate `logs` exists, has required fields (`source`, `severity`, `message`) before producing |
| I2 | [sanitizeLogs()](file:///d:/Sentinel/packages/shared-utils/src/sanitizeLogs.ts#24-109) — system events & alert creation commented out | Un-comment when you're ready to implement the full policy violation flow |
| I3 | No `ingest.analyzed` or policy violation Kafka events | Add events when sanitization detects policy violations |
| I4 | Audit & notification services have no HTTP server | Add Express + health endpoint on ports 4003/4004 |
| I5 | Incident-service auth middleware not applied to routes | Apply [authenticate](file:///d:/Sentinel/src/services/incident-service/src/middlewares/authMiddleware.ts#10-23) middleware to protected routes |

---

## 🟢 Minor / Code Quality

| # | Issue | What to Do |
|---|---|---|
| Q3 | `concurrently` used in root scripts but not installed | `npm install -D concurrently` |
| Q4 | Hardcoded email sender in notification email.ts | Use `process.env.EMAIL_FROM` |
| Q5 | Seed file uses plaintext password hashes | Generate with bcrypt |
| Q8 | Empty [producer.ts](file:///d:/Sentinel/src/services/audit-service/src/kafka/producer.ts) files in audit & notification services | Delete them |
| Q9 | Commented-out code in gateway rateLimiter, firewall consumer, etc. | Clean up |

---

## Updated Implementation Plan

### ~~Phase 1: TypeScript Config~~ ✅
### ~~Phase 2: Shared-Utils Foundation~~ ✅
### ~~Phase 3: Core Service Fixes~~ ✅ (mostly)

**Remaining in Phase 3:**
1. Fix auth middleware: re-export from [index.ts](file:///d:/Sentinel/src/gateway/src/index.ts), change import path in gateway **(W1)**
2. Add `express` + `jsonwebtoken` to shared-utils dependencies **(W1)**
3. Fix `incident.manual_created` Kafka key **(W2)**
4. Fix or remove analyzer route in firewall **(W3)**
5. Call [aiAnalyzer()](file:///d:/Sentinel/src/services/firewall-service/src/kafka/consumer.ts#9-61) in firewall server startup **(W4)**

### Phase 4: Complete Event Flow
1. Add input validation in firewall ingest controller **(I1)**
2. Un-comment system events in [sanitizeLogs()](file:///d:/Sentinel/packages/shared-utils/src/sanitizeLogs.ts#24-109) **(I2)**
3. Add policy violation Kafka events **(I3)**
4. Apply auth middleware to incident routes **(I5)**

### Phase 5: Production Hardening
1. Add Express + health endpoints to audit & notification services **(I4)**
2. Install `concurrently` **(Q3)**
3. Move email sender to env var **(Q4)**
4. Fix seed passwords **(Q5)**
5. Delete empty producer files **(Q8)**
6. Clean up commented code **(Q9)**
7. Add `dist/` to [.gitignore](file:///d:/Sentinel/.gitignore)
