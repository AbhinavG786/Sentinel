import { initKafka } from "./kafka/kafka";
import { consumeIncidentCreatedEvent } from "./kafka/consumer";
import { startAIUpdateConsumer } from "./kafka/consumer";
import { getRedisClient } from "@shared/utils";

export const redisClient = getRedisClient();

(async () => {
  await initKafka();
  await consumeIncidentCreatedEvent();
  await startAIUpdateConsumer();
  console.log(
    "Incident Service consuming incident.created and incident.analyzed"
  );
})();

