import { initKafka } from "./kafka/kafka";
import { consumeIncidentCreatedEvent } from "./kafka/consumer";
import { startAIUpdateConsumer } from "./kafka/consumer";
import { getRedisClient } from "@shared/utils";
import express from "express";
import incidentsRouter from "./routes/incidents.route";  
import { authenticate } from "@shared/utils";

const app = express();  
app.use(express.json());

export const redisClient = getRedisClient();

app.use("/incidents",authenticate,incidentsRouter);

(async () => {
  await initKafka();
  await consumeIncidentCreatedEvent();
  await startAIUpdateConsumer();
  console.log(
    "Incident Service consuming incident.created and incident.analyzed"
  );
})();

app.listen(4001, () => {
  console.log("Incident Service running on port 4001");
});
