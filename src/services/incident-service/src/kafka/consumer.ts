import { db } from "shared-utils/src/db/knex";
import { producer, consumer } from "./kafka";
import {
  IncidentCreatedEvent,
  IncidentStoredEvent,
} from "shared-utils/src/types";
import { v4 as uuidv4 } from "uuid";

export const initAIResultsConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "incident-ai-results",
    fromBeginning: false,
  });
  console.log("Incident service now listening for AI results");

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message.key?.toString() !== "incident.analyzed" || !message.value)
        return;
      const { incidentId, summary } = JSON.parse(message.value!.toString());

      //   await pool.query(
      //     `UPDATE incidents SET ai_summary = $1, updated_at = NOW() WHERE id = $2`,
      //     [summary, incidentId]
      //   );
      const [updatedIncident] = await db("incidents")
        .where({ id: incidentId })
        .update({ ai_summary: summary, updated_at: new Date() })
        .returning("*");

      console.log(` Incident ${incidentId} updated with AI summary`);
    },
  });
};

export const consumeIncidentCreatedEvent = async () => {
  await consumer.subscribe({ topic: "incident.created", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.key?.toString() !== "incident.created" || !message.value) {
        return;
      }
      const event: IncidentCreatedEvent = JSON.parse(message.value!.toString());
      console.log("Received incident created event:", event.tempId);
      const { tempId, traceId, source, severity, sanitizedSnippet } = event;
      const duplicate = await db("incidents")
        .where({ temp_id: tempId })
        .first();
      if (duplicate) {
        console.log(
          `Duplicate incident with tempId ${tempId} detected. Skipping insertion.`
        );
        return;
      }
      const incidentId = uuidv4();
      await db("incidents").insert({
        id: incidentId,
        temp_id: tempId,
        trace_id: traceId,
        source,
        severity,
        sanitized_snippet: sanitizedSnippet,
      });

      const storedEvent: IncidentStoredEvent = {
        incidentId,
        tempId,
        source,
        severity,
        sanitizedSnippet,
        storedAt: new Date().toISOString(),
      };

      await producer.send({
        topic: "incident.stored",
        messages: [{ key: incidentId, value: JSON.stringify(storedEvent) }],
      });

      console.log(`Incident stored with ID: ${incidentId} from tempId: ${tempId}`);
    },
  });
};
