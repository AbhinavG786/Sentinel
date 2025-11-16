import { initKafka } from "./kafka/kafka";
import { startAuditAlertConsumers } from "./kafka/consumer";

(async () => {
  await initKafka();
  await startAuditAlertConsumers();
  console.log(
    "Audit Service consuming audit.event and alert.created"
  );
})();
