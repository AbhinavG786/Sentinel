import kafka from "shared-utils/src/kafka";
import axios from "axios";
import { Consumer } from "kafkajs";
import { Producer } from "kafkajs";
import {db} from "shared-utils/src/db/knex"
import {IncidentCreatedEvent} from "shared-utils/src/types"
import { sanitizeLogs } from "shared-utils//src/sanitizeLogs";

const producer: Producer = kafka.producer();

const consumer: Consumer = kafka.consumer({ groupId: "firewall-analyzer" });

export const readIncident = async () => {
  await consumer.subscribe({ topic: "incident-events", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.key?.toString() !== "incident.created" || !message.value) {
        return;
      }
      const incident = JSON.parse(message.value.toString());
      console.log("Received incident event for sanitization:", incident.title);

      const sanitizedIncident = await sanitizeLogs(db, incident);
      try {
        const analysis = await axios.post("http://localhost:4002/api/analyze", {
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
