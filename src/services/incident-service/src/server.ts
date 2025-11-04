import { initKafka } from "./kafka/kafka";
import { consumeIncidentCreatedEvent } from "./kafka/consumer";



(async () => {
  await initKafka();
  await consumeIncidentCreatedEvent();
  console.log("Incident Service consuming incident.created");
})();