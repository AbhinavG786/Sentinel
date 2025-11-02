import kafka from "shared-utils/src/kafka";
import axios from "axios";
import { Consumer } from "kafkajs";
import { Producer } from "kafkajs";
import {sanitizeIncidentData} from "shared-utils/src/sanitizeIncidentData";
import {db} from "shared-utils/src/db/knex"

const producer: Producer = kafka.producer();

const consumer: Consumer = kafka.consumer({ groupId: "firewall-analyzer" });

export const initConsumer = async () => {
  await consumer.connect();
  console.log("Kafka Consumer connected");
  await producer.connect();
  console.log("Kafka Producer connected");
  await consumer.subscribe({ topic: "incident-events", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.key?.toString() !== "incident.created" || !message.value) {
        return;
      }
      const incident = JSON.parse(message.value.toString());
      console.log("Received incident event for sanitization:", incident.title);

      const sanitizedIncident = await sanitizeIncidentData(db, incident);
      try {
        const analysis = await axios.post("http://localhost:4002/analyze", {
          incident: sanitizedIncident,
        });
          //  const summary = analysis.data.summary;
          let summary=""
        console.log(" AI summary received:", summary.slice(0, 100));

        await db("incidents").where({ id: incident.id }).update({
          ai_analysis: summary,
        });

        // Step 4: Send to Kafka for incident update
        await producer.send({
          topic: "incident-ai-results",
          messages: [
            {
              key: "incident.analyzed",
              value: JSON.stringify({
                incidentId: incident.id,
                summary,
              }),
            },
          ],
        });
      } catch (err: any) {
        console.error("AI Analysis Error:", err.message);
      }
    },
  });
};
