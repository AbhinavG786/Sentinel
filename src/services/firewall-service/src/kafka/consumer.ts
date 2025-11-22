import axios from "axios";

import {
  IncidentAnalyzedEvent,
  IncidentStoredEvent,
} from "@shared/utils";
import { consumer } from "./kafka";
import { producer } from "./kafka";

export const aiAnalyzer = async () => {
  await consumer.subscribe({ topic: "incident.stored" });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.key?.toString() !== "incident.stored" || !message.value) {
        return;
      }
      const incident = JSON.parse(
        message.value.toString()
      ) as IncidentStoredEvent;
      console.log(
        "Received incident event for sanitization:",
        incident.incidentId
      );

      try {
        const analysis: any = await axios.post(
          "http://localhost:4002/api/analyze",
          {
            incident: incident.sanitizedSnippet,
          }
        );
        //  const summary = analysis.data.summary;
        console.log(" AI summary received:", analysis.data.summary);

        // await db("incidents").where({ id: incident.id }).update({
        //   ai_analysis: summary,
        // });

        const analyzedEvent: IncidentAnalyzedEvent = {
          incidentId: incident.incidentId,
          ...analysis.data,
          analyzedAt: new Date().toISOString(),
        };

        // Step 4: Send to Kafka for incident update
        await producer.send({
          topic: "incident.analyzed",
          messages: [
            { key: incident.incidentId, value: JSON.stringify(analyzedEvent) },
          ],
        });

        console.log(` Analysis done → ${incident.incidentId}`);
      } catch (err: any) {
        console.error("AI Analysis Error:", err.message);
      }
    },
  });
};
