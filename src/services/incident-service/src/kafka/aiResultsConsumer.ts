import kafka from "shared-utils/src/kafka";
import { db } from "shared-utils/src/db/knex";

const consumer = kafka.consumer({ groupId: "incident-updater" });

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
