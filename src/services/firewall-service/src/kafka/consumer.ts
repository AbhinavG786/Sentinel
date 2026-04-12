import { analyzeIncident } from "../ai/analyzer";
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
      if (!message.value) {
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
        const analysis: any = await analyzeIncident(incident.sanitizedSnippet);
        console.log(" AI summary received:", analysis.summary);

        const analyzedEvent: IncidentAnalyzedEvent = {
          incidentId: incident.incidentId,
          traceId: incident.traceId,
          ...analysis,
          analyzedAt: new Date().toISOString(),
        };

        await producer.send({
          topic: "incident.analyzed",
          messages: [
            { key: incident.incidentId, value: JSON.stringify(analyzedEvent) },
          ],
        });

        console.log(` Analysis done → ${incident.incidentId} [trace: ${incident.traceId}]`);
      } catch (err: any) {
        console.error("AI Analysis Error:", err.message);
      }
    },
  });
};
