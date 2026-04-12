import { initKafka } from "./kafka/kafka";
import { startAuditAlertConsumers } from "./kafka/consumer";
import express from "express";
import { authenticate } from "@shared/utils";
import auditRouter from "./routes/audit.route";
import policyLogsRouter from "./routes/policy-logs.route";

const app = express();
app.use(express.json());

(async () => {
  await initKafka();
  await startAuditAlertConsumers();
  console.log(
    "Audit Service consuming audit.event, alert.created, and policy.violation"
  );
})();

app.get("/health", (req, res) => {
  res.json({ message: "Audit Service is running" });
});

app.use("/audit-logs", authenticate, auditRouter);
app.use("/policy-logs", authenticate, policyLogsRouter);

app.listen(4003, () => {
  console.log("Audit Service running on port 4003");
});
