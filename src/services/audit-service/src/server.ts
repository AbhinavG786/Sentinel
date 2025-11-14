import { initKafka } from "./kafka/kafka";
import { startAuditConsumer } from "./kafka/consumer";

(async () => {
  await initKafka();
  await startAuditConsumer();
  console.log(
    "Audit Service consuming audit.event"
  );
})();
