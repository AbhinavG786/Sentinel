import { consumer } from "./kafka";
import { sendSlack } from "../integrations/slack";
import { sendEmail } from "../integrations/email";
import { db } from "@shared/utils/src/db/knex";

export const startNotificationConsumer = async () => {
  await consumer.subscribe({ topic: "alert.created" });
  console.log("Notification worker consuming alert.created");

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const alert = JSON.parse(message.value.toString());

      const [sysEvent] = await db("system_events")
        .insert({
          event_type: "alert.created",
          source: "notification-service",
          payload: alert,
        })
        .returning("*");

      // Slack
      const text = ` *${alert.severity.toUpperCase()} ALERT*  
Incident: ${alert.incident_id}  
Message: ${alert.message}`;
      await sendSlack(text);

      // Email
      await sendEmail({
        to: "oncall-team@company.com",
        subject: `ALERT: ${alert.severity} severity`,
        body: `
Incident ID: ${alert.incident_id}
Message: ${alert.message}
Severity: ${alert.severity}
        `,
      });

      console.log("Alert notification sent");

      await db("system_events")
        .where({ id: sysEvent.id })
        .update({ processed: true });

      console.log("[Notification] Alert processed.");
    },
  });
};
