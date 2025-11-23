import { initKafka } from "./kafka/kafka";
import { startNotificationConsumer } from "./kafka/consumer";

(async () => {
  await initKafka();
  await startNotificationConsumer();
  console.log(
    "Notification Service consuming alert.created events"
  );
})();
